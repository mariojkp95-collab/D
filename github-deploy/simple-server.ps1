# Simple HTTP Server for DRAKORIA
Write-Host "Starting DRAKORIA Server..." -ForegroundColor Green

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8080/')
$listener.Start()

Write-Host "Server running at http://localhost:8080/" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $path = $request.Url.LocalPath
    if ($path -eq '/') { $path = '/index.html' }
    
    $filePath = Join-Path (Get-Location) $path.TrimStart('/')
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
        
        # Set content type
        $ext = [System.IO.Path]::GetExtension($filePath)
        switch ($ext) {
            '.html' { $response.ContentType = 'text/html; charset=utf-8' }
            '.css' { $response.ContentType = 'text/css; charset=utf-8' }
            '.js' { $response.ContentType = 'application/javascript; charset=utf-8' }
            '.json' { $response.ContentType = 'application/json; charset=utf-8' }
            default { $response.ContentType = 'text/plain; charset=utf-8' }
        }
        
        $response.ContentLength64 = $buffer.Length
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        Write-Host "Served: $path" -ForegroundColor Green
    } else {
        $response.StatusCode = 404
        Write-Host "404: $path" -ForegroundColor Red
    }
    
    $response.Close()
}

$listener.Stop()