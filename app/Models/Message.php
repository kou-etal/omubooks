<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'trade_id',
        'from_user_id',
        'to_user_id',
        'body',
        'attachments',
        'is_system',
    ];

    protected $casts = [
        'attachments' => 'array',
        'is_system'   => 'boolean',
    ];

    public function trade()
    {
        return $this->belongsTo(Trade::class);
    }

    public function from()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function to()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }
}
