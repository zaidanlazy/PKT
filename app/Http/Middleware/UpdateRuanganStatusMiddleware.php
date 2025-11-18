<?php

namespace App\Http\Middleware;

use Closure;
use App\Helpers\RapatHelper;

class UpdateRuanganStatusMiddleware
{
    public function handle($request, Closure $next)
    {
        // panggil helper dengan benar
        RapatHelper::updateStatus();

        return $next($request);
    }
}
