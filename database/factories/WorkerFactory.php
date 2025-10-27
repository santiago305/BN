<?php

namespace Database\Factories;

use App\Models\Worker;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<\App\Models\Worker>
 */
class WorkerFactory extends Factory
{
    protected $model = Worker::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->userName(),
            'dni' => $this->faker->unique()->numerify('###########'),
            'password' => Hash::make('secret'),
            'is_in_use' => false,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => [
            'is_active' => false,
        ]);
    }

    public function inUse(): static
    {
        return $this->state(fn () => [
            'is_in_use' => true,
        ]);
    }
}
