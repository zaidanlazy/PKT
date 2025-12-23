<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void
    {
        parent::setUp();

        // Pastikan tidak ada ini:
        // Ruangan::factory()->count(10)->create(); // ← HAPUS INI
    }
}
