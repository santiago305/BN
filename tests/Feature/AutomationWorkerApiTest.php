<?php

use App\Models\Worker;
use Illuminate\Support\Facades\Hash;
use function Pest\Laravel\getJson;
use function Pest\Laravel\postJson;

it('returns the in use status for a worker by name', function () {
    $worker = Worker::factory()->create([
        'name' => 'automation_user',
        'is_in_use' => true,
    ]);

    $response = getJson('/api/automation/workers?name=' . $worker->name);

    $response->assertOk();

    expect(json_decode($response->content(), true))->toBeTrue();
});

it('returns the in use status for a worker by dni', function () {
    $worker = Worker::factory()->create([
        'dni' => '12345678',
        'is_in_use' => false,
    ]);

    $response = getJson('/api/automation/workers?dni=' . $worker->dni);

    $response->assertOk();

    expect(json_decode($response->content(), true))->toBeFalse();
});


it('marks a worker as in use when credentials are valid', function () {
    $worker = Worker::factory()->create([
        'name' => 'automation',
        'password' => Hash::make('secret123'),
        'is_in_use' => false,
    ]);

    postJson('/api/automation/workers/usage', [
        'name' => 'automation',
        'password' => 'secret123',
        'is_in_use' => true,
    ])->assertOk()
        ->assertJsonPath('data.is_in_use', true);

    expect($worker->fresh()->is_in_use)->toBeTrue();
});

it('releases a worker when automation finishes', function () {
    $worker = Worker::factory()->create([
        'name' => 'automation-release',
        'password' => Hash::make('secret123'),
        'is_in_use' => true,
    ]);

    postJson('/api/automation/workers/usage', [
        'name' => 'automation-release',
        'password' => 'secret123',
        'is_in_use' => false,
    ])->assertOk()
        ->assertJsonPath('data.is_in_use', false);

    expect($worker->fresh()->is_in_use)->toBeFalse();
});

it('rejects invalid credentials', function () {
    Worker::factory()->create([
        'name' => 'automation-invalid',
        'password' => Hash::make('correct-password'),
    ]);

    postJson('/api/automation/workers/usage', [
        'name' => 'automation-invalid',
        'password' => 'wrong',
        'is_in_use' => true,
    ])->assertStatus(401);
});

it('prevents marking inactive workers as in use', function () {
    Worker::factory()->inactive()->create([
        'name' => 'automation-inactive',
        'password' => Hash::make('secret123'),
    ]);

    postJson('/api/automation/workers/usage', [
        'name' => 'automation-inactive',
        'password' => 'secret123',
        'is_in_use' => true,
    ])->assertStatus(409);
});

it('can override the in use flag with the force parameter', function () {
    $worker = Worker::factory()->create([
        'name' => 'automation-force',
        'password' => Hash::make('secret123'),
        'is_in_use' => true,
    ]);

    postJson('/api/automation/workers/usage', [
        'name' => 'automation-force',
        'password' => 'secret123',
        'is_in_use' => true,
        'force' => true,
    ])->assertOk();

    expect($worker->fresh()->is_in_use)->toBeTrue();
});

it('returns 404 when filtering by a non existing worker', function () {
    getJson('/api/automation/workers?name=unknown-user')->assertStatus(404);
});
