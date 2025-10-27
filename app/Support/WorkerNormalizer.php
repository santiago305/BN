<?php

namespace App\Support;

use Carbon\Carbon;
use Carbon\CarbonInterface;
use DateTimeInterface;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Arr;
use JsonSerializable;

class WorkerNormalizer
{
    /**
     * Normalize a single worker record into an array with consistent types.
     */
    public static function normalize(array|object $worker): array
    {
        $payload = self::resolvePayload($worker);

        return [
            'id' => $payload['id'] ?? null,
            'name' => $payload['name'] ?? null,
            'dni' => $payload['dni'] ?? null,
            'is_in_use' => array_key_exists('is_in_use', $payload) ? (bool) $payload['is_in_use'] : false,
            'is_active' => array_key_exists('is_active', $payload) ? (bool) $payload['is_active'] : false,
            'created_at' => self::formatDate(Arr::get($payload, 'created_at')),
            'updated_at' => self::formatDate(Arr::get($payload, 'updated_at')),
        ];
    }

    /**
     * Normalize a list of workers.
     */
    public static function normalizeMany(iterable $workers): array
    {
        $normalized = [];

        foreach ($workers as $worker) {
            $normalized[] = self::normalize($worker);
        }

        return $normalized;
    }

    private static function resolvePayload(array|object $worker): array
    {
        if (is_array($worker)) {
            return $worker;
        }

        if ($worker instanceof Arrayable) {
            return $worker->toArray();
        }

        if ($worker instanceof JsonSerializable) {
            return (array) $worker->jsonSerialize();
        }

        return (array) $worker;
    }

    private static function formatDate(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if ($value instanceof CarbonInterface) {
            return $value->toISOString();
        }

        if ($value instanceof DateTimeInterface) {
            return Carbon::instance($value)->toISOString();
        }

        return Carbon::parse((string) $value)->toISOString();
    }
}
