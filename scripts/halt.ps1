# Stop the site and the API. PostgreSQL is left running.
foreach ($port in 3000, 4000) {
  $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if ($conns) {
    $conns | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Write-Host "stopped :$port"
  } else {
    Write-Host "nothing on :$port"
  }
}
