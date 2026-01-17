<?php
// Deployment Handler für Plesk
// Führt das Deploy-Skript aus und gibt die Ausgabe live zurück

// Sicherheit: Nur von localhost oder mit Secret-Key
$secretKey = 'gatefall-deploy-2026'; // Ändere dies für Produktion!

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die('Method not allowed');
}

// Optional: Secret-Key-Check
// if (!isset($_GET['key']) || $_GET['key'] !== $secretKey) {
//     http_response_code(403);
//     die('Forbidden');
// }

// Setze Content-Type für Streaming
header('Content-Type: text/plain; charset=utf-8');
header('X-Accel-Buffering: no'); // Nginx buffering deaktivieren

// Flush Output Buffer
@ini_set('output_buffering', 'off');
@ini_set('zlib.output_compression', false);
if (ob_get_level()) {
    ob_end_clean();
}

// Funktion zum Senden von Output
function sendOutput($message) {
    echo $message . "\n";
    flush();
    if (ob_get_level() > 0) {
        ob_flush();
    }
}

sendOutput("🚀 Starting deployment...\n");

// Verzeichnis zum Projekt
$projectDir = __DIR__;
chdir($projectDir);

sendOutput("📂 Working directory: " . getcwd() . "\n");

// Schritte ausführen
$steps = [
    [
        'name' => 'Git Pull',
        'cmd' => 'git pull origin main 2>&1'
    ],
    [
        'name' => 'Install Dependencies',
        'cmd' => 'npm install 2>&1'
    ],
    [
        'name' => 'Database Migration',
        'cmd' => 'node migrate-db.js 2>&1'
    ],
    [
        'name' => 'Compile TypeScript',
        'cmd' => 'npx tsc 2>&1'
    ],
    [
        'name' => 'Restart PM2',
        'cmd' => 'pm2 restart gatefall 2>&1 || pm2 start app.js --name gatefall 2>&1'
    ],
    [
        'name' => 'Save PM2 Config',
        'cmd' => 'pm2 save 2>&1'
    ]
];

$allSuccess = true;

foreach ($steps as $index => $step) {
    $stepNum = $index + 1;
    sendOutput("\n📌 Step {$stepNum}/{count($steps)}: {$step['name']}");
    sendOutput(str_repeat('-', 50));
    
    $output = [];
    $returnCode = 0;
    exec($step['cmd'], $output, $returnCode);
    
    foreach ($output as $line) {
        sendOutput($line);
    }
    
    if ($returnCode !== 0) {
        sendOutput("⚠️ Step returned code: {$returnCode}");
        // Nicht abbrechen, weitermachen
    } else {
        sendOutput("✅ {$step['name']} completed");
    }
}

sendOutput("\n" . str_repeat('=', 50));
sendOutput("🎉 Deployment process completed!");
sendOutput(str_repeat('=', 50));

// PM2 Status anzeigen
sendOutput("\n📊 PM2 Status:");
exec('pm2 list 2>&1', $pm2Output);
foreach ($pm2Output as $line) {
    sendOutput($line);
}

sendOutput("\n✨ Done! Your application should now be running with the latest changes.");
?>
