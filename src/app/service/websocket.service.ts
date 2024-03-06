import { Injectable } from '@angular/core';
import {Stomp,Client} from '@stomp/stompjs';

import * as SockJS from 'sockjs-client';
import { Subject } from 'rxjs';

import { Type } from '../enum/typeMessage';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any;
  private readonly serverUrl = 'http://localhost:8080/ws';
  private messageSubject = new Subject<any>();
  constructor() { }

  connect(username: string): void {
    const socket = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({}, () => {
      console.log('Connected to WebSocket');
      this.stompClient.subscribe('/topic/public', (message: any) => {
        this.messageSubject.next(JSON.parse(message.body));
      });

      this.sendUserName(username);
    }, (error: any) => {
      console.error('Error in WebSocket:', error);
    });
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
    }
  }

  sendMessage(message: string, user: string): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify({ content: message, type: Type.CHAT ,sender: user}));
    }
  }

  private sendUserName(username: string): void {
    this.stompClient.send('/app/chat.addUser', {}, JSON.stringify({ sender: username, type: Type.JOIN }));
  }
  
  subscribeToMessages() {
    return this.messageSubject.asObservable();
  }
}