<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class KeyGenerateCommand extends Command
{
    protected $signature = 'key:generate';

    protected $description = 'Generate key application.';

    public function handle(): void
    {
        $appKey = base64_encode(Str::random(32));
        $this->info($appKey);
    }

}
