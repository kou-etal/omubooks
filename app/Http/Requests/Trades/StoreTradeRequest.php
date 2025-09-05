<?php

namespace App\Http\Requests\Trades;

use Illuminate\Foundation\Http\FormRequest;

class StoreTradeRequest extends FormRequest
{
    public function authorize(): bool { return auth()->check(); }

    public function rules(): array
    {
        return [
            'listing_id' => ['required','integer','exists:listings,id'],
        ];
    }
}
