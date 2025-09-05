<?php

namespace App\Http\Requests\Reviews;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool { return auth()->check(); }

    public function rules(): array
    {
        return [
            'score'   => ['required','integer','in:1,2,3,4,5'],
            'comment' => ['nullable','string','max:1000'],
        ];
    }
}
