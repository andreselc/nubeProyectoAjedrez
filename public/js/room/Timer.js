class Timer{
    constructor(player, roomId, minutes, seconds, updatedTimerCallback, timerEndedCallback){
        this.player = player;
        this.roomId = roomId;
        this.minutes = minutes;
        this.seconds = seconds;
        this.interval = null;
        this.updatedTimerCallback = updatedTimerCallback;
        this.timerEndedCallback = timerEndedCallback;
    }

    start(){

    }

    stop(){

    }
}