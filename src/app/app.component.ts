import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { WebSocketService } from './service/websocket.service';
import { Message } from './models/Message';
import { Type } from './enum/typeMessage';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})



export class AppComponent implements OnInit{
  @ViewChild('messageArea') messageArea!: ElementRef;
  messageToSend: string = "";
  WebSocketService: any;
  username: string = ""
  showDiv: boolean = true;
  fixedColor: string = this.getRandomColor();
  messages: Message[] = [];
  TypeChat = Type;
  
  constructor(private webSocketService: WebSocketService, private cdr: ChangeDetectorRef) {
   }

  ngOnInit(): void {
    this.webSocketService.subscribeToMessages().subscribe(message => {
      let msj : Message = {
        sender: message.sender,
        content: message.content,
        type: message.type,
        color: null
      }
      
      msj = this.colorAddUpdate(msj);
      this.messages.push(msj);
      
          // Scroll al final del área de mensajes después de un pequeño retraso
    setTimeout(() => {
      this.scrollToBottom();
    }, 100); // Ajusta este valor según sea necesario
    });
  }
  scrollToBottom(): void {
    try {
      this.messageArea.nativeElement.scrollTop = this.messageArea.nativeElement.scrollHeight;
    } catch(err) { }
  }
  colorAddUpdate(msj:Message ):Message{
    if (msj.type == 'JOIN') {
      msj.color = this.getRandomColor();
    }

    this.messages.forEach(mess => {
      if (mess.sender == msj.sender) {
        msj.color = mess.color;
      }
      else if (!msj.color) {
        msj.color = this.getRandomColor();
      }
    });
    return msj 
  }

  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  hideDiv(): void {
    this.showDiv = false;
  }
  connect(username: string): void {
    this.username = username
    this.webSocketService.connect(username);
    this.hideDiv()
  }
  disconnect():void{
    this.WebSocketService.disconnect()
  }
  sendMessage(): void {
    if (this.messageToSend) {
      this.webSocketService.sendMessage(this.messageToSend, this.username);
      this.messageToSend = '';
    }
  }
}
