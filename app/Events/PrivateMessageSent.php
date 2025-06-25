<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PrivateMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

   public $message;
   public $from_user_id;
   public $to_user_id;


     public function __construct($message, $fromUserId, $toUserId)
    {
        $this->message = $message;
        $this->from_user_id = $fromUserId;
        $this->to_user_id = $toUserId;
    }
   
    /*public function broadcastOn()
    {
        return new PrivateChannel('chat.' . $this->toUserId);
    }*/
    
       public function broadcastOn()
   {
    $participants = [$this->from_user_id, $this->to_user_id];
    sort($participants);
    return new PrivateChannel('private-chat.' . $participants[0] . '.' . $participants[1]);
}
  public function broadcastAs()
    {
        return 'PrivateMessageSent';
    }

}
