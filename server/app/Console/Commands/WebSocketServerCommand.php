<?php

namespace App\Console\Commands;

use App\Http\Controllers\WebSocket\WebSocketController;
use Illuminate\Console\Command;
use Ratchet\Http\HttpServer;
use Ratchet\Server\IoServer;
use Ratchet\WebSocket\WsServer;

class WebSocketServerCommand extends Command
{
    protected $signature = 'websocket:start {--port=}';

    protected $description = 'Command starting the websocket server.';

    public function handle()
    {
        $this->comment('Starting server...');

        $server = IoServer::factory(
            new HttpServer(
                new WsServer(
                    new WebSocketController()
                )
            ),
            $this->option('port') ?: 9091
        );

        $server->run();
    }
}
