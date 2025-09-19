<?php
namespace App\Http\Requests\Reviews;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'score'   => ['required','integer','min:1','max:5'],
            'comment' => ['nullable','string','max:2000'],
        ];
    }
}
