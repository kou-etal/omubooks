<?php

namespace App\Http\Requests\Listings;

use Illuminate\Foundation\Http\FormRequest;

class SearchListingRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'q'        => ['nullable','string','max:255'],
            'per_page' => ['nullable','integer','min:1','max:100'],
        ];
    }
}
