<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFilterConfigRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'working_hours' => ['required', 'array'],
            'captcha_type' => ['required', Rule::in(['cloudflare', 'recaptcha'])],
            'relogin_interval' => ['required', 'integer', 'min:1'],
            'filter_url' => ['required', 'url'],
            'search_without_results' => ['required', 'boolean'],
            'worker_ids' => ['nullable', 'array'],
            'worker_ids.*' => ['uuid', Rule::exists('workers', 'id')],
        ];

        foreach ($days as $day) {
            $rules["working_hours.$day"] = ['required', 'array'];
            $rules["working_hours.$day.start"] = ['required', 'date_format:H:i'];
            $rules["working_hours.$day.end"] = ['required', 'date_format:H:i'];
        }

        return $rules;
    }

    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);

        if (array_key_exists('worker_ids', $validated ?? [])) {
            $validated['worker_ids'] = array_values(array_unique($validated['worker_ids']));
        }

        return $validated;
    }
}
