<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ServeCommand extends Command
{
    protected $signature = 'serve {--host=} {--port=}';

    protected $description = 'Command starting development server.';

    public function handle()
    {
        $host = $this->input->getOption('host');
        $port = $this->input->getOption('port');

        exec('php -S ' . ($host ?: $this->getDefaultHostName()) . ':' . ($port ?: $this->getDefaultPort()) . ' -t' . base_path() . '\public');
    }

    protected function getDefaultHostName(): string
    {
        return parse_url(getenv('APP_URL'), PHP_URL_HOST);
    }

    protected function getDefaultPort(): string
    {
        return parse_url(getenv('APP_URL'), PHP_URL_PORT);
    }
}
