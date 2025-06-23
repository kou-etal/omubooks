// MyPi.h

//温度センサADT7410用関数
extern double Adt7410Read(int fd);

//LCD AQM1602用関数
extern int LcdSetup(int fd);
extern int LcdWriteChar(int fd, char c);
extern int LcdNewline(int fd);
extern int LcdClear(int fd);
extern int LcdWriteString(int fd, char *s);

