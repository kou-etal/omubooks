/
#include <stdio.h>			
#include <stdlib.h>					
#include <wiringPi.h>		

#define BUZZER 18		
#define SW0    4			

int main (void){


    unsigned int range = 100; 	
	wiringPiSetupGpio();		
	pinMode(SW0,INPUT);			
	pullUpDnControl(SW0,PUD_DOWN);	
	pinMode(BUZZER, PWM_OUTPUT);	
	pwmSetClock(divisor);			
	pwmSetRange(range);			    	
	pwmSetMode(PWM_MODE_MS);		
	
	while(1){
		if(digitalRead(SW0)==HIGH){	    
			pwmWrite(BUZZER,range/2);	
		}
		else{						    
			pwmWrite(BUZZER,0);	        
		}
	}
	return EXIT_SUCCESS;
}
