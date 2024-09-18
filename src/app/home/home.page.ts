// import { Component, OnInit } from '@angular/core';
// import io from 'socket.io-client';
// import { AuthService } from 'services/auth.service';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-home',
//   templateUrl: 'home.page.html',
//   styleUrls: ['home.page.scss'],
// })
// export class HomePage implements OnInit {
//   private socket: any;
//   private peerConnection: RTCPeerConnection | undefined;
//   private localStream: any;
//   private remoteStream: MediaStream | undefined;

//   public roomId: string = '';
//   public message: string = '';
//   public inCall: boolean = false;
//   public isAuthenticated: boolean = false;
//   public username: string = '';
//   public password: string = '';
//   private token: string | null = null;

//   private servers = {
//     iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//   };

//   constructor(private authService: AuthService, private router: Router) {}

//   ngOnInit() {
//     this.token = this.authService.getToken();
//     this.isAuthenticated = !!this.token;

//     this.socket = io('http://64.227.191.74:9090', { transports: ['websocket', 'polling'] });

//     this.socket.on('offer', async (offer: RTCSessionDescriptionInit) => {
//       if (this.peerConnection) {
//         await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//         const answer = await this.peerConnection.createAnswer();
//         await this.peerConnection.setLocalDescription(answer);
//         this.socket.emit('answer', this.roomId, answer);
//       }
//     });

//     this.socket.on('answer', async (answer: RTCSessionDescriptionInit) => {
//       if (this.peerConnection) {
//         await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//       }
//     });

//     this.socket.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
//       if (this.peerConnection) {
//         await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//       }
//     });

//     this.socket.on('chat-message', (message: string) => {
//       this.addMessage(`Other: ${message}`);
//     });

//     this.socket.on('user-disconnected', (userId: string) => {
//       console.log(`${userId} disconnected`);
//       this.endCall();
//     });
//   }

//   async joinCall() {
//     if (!this.roomId) {
//       alert('Please enter a room ID');
//       return;
//     }

//     this.socket.emit('join', this.roomId);

//     try {
//       // Start local media stream with echo cancellation
//       this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: { echoCancellation: true } });
//       const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
//       localVideo.srcObject = this.localStream;
//       localVideo.muted = true; // Mute local video playback to avoid hearing own voice

//       // Initialize peer connection
//       this.peerConnection = new RTCPeerConnection(this.servers);

//       // Handle ICE candidates
//       this.peerConnection.onicecandidate = (event: any) => {
//         if (event.candidate) {
//           this.socket.emit('ice-candidate', this.roomId, event.candidate);
//         }
//       };

//       // Handle remote track
//       this.peerConnection.ontrack = (event: any) => {
//         if (!this.remoteStream) {
//           this.remoteStream = new MediaStream();
//           const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
//           remoteVideo.srcObject = this.remoteStream;
//         }
//         this.remoteStream.addTrack(event.track);

//         // Debugging logs for remote track
//         console.log('Remote track added:', event.track);
//         console.log('Remote Stream Tracks:', this.remoteStream.getTracks());
//       };

//       // Add local tracks to peer connection
//       if (this.localStream) {
//         this.localStream.getTracks().forEach((track: any) => {
//           this.peerConnection?.addTrack(track, this.localStream);
//         });

//         // Debugging logs for local audio track
//         console.log('Local audio track enabled:', this.localStream.getAudioTracks().every((track:any) => track.enabled));
//       }

//       // Create and send offer
//       const offer = await this.peerConnection.createOffer();
//       await this.peerConnection.setLocalDescription(offer);
//       this.socket.emit('offer', this.roomId, offer);

//       this.inCall = true;
//     } catch (error) {
//       console.error('Error joining call:', error);
//     }
//   }

//   endCall() {
//     if (this.peerConnection) {
//       this.peerConnection.close();
//       this.peerConnection = undefined;
//     }

//     if (this.localStream) {
//       this.localStream.getTracks().forEach((track: any) => {
//         console.log('Stopping local track:', track);
//         track.stop();
//       });
//       this.localStream = undefined;
//     }

//     if (this.remoteStream) {
//       this.remoteStream.getTracks().forEach(track => {
//         console.log('Stopping remote track:', track);
//         track.stop();
//       });
//       this.remoteStream = undefined;
//     }

//     (document.getElementById('localVideo') as HTMLVideoElement).srcObject = null;
//     (document.getElementById('remoteVideo') as HTMLVideoElement).srcObject = null;

//     this.socket.disconnect();
//     this.inCall = false;
//   }

//   sendMessage() {
//     if (this.message) {
//       this.socket.emit('chat-message', this.roomId, this.message);
//       this.addMessage(`You: ${this.message}`);
//       this.message = '';
//     }
//   }

//   addMessage(message: string) {
//     const chatMessages = document.getElementById('chatMessages') as HTMLDivElement;
//     const messageElement = document.createElement('div');
//     messageElement.textContent = message;
//     chatMessages.appendChild(messageElement);
//     chatMessages.scrollTop = chatMessages.scrollHeight;
//   }

//   signIn() {
//     this.authService.signin(this.username, this.password).subscribe({
//       next: (response) => {
//         localStorage.setItem('token', response.token);
//         this.isAuthenticated = true;
//         this.router.navigate(['/profiles']);
//       },
//       error: (err: any) => {
//         console.error('Sign In Error:', err);
//       }
//     });
//   }

//   signUp() {
//     this.authService.signup(this.username, this.password).subscribe({
//       next: (response) => {
//         console.log('Sign Up Successful:', response);
//       },
//       error: (err) => {
//         console.error('Sign Up Error:', err);
//       }
//     });
//   }
// }







// import { Component, OnInit } from '@angular/core';
// import { Platform } from '@ionic/angular';
// import io from 'socket.io-client';

// @Component({
//   selector: 'app-home',
//   templateUrl: 'home.page.html',
//   styleUrls: ['home.page.scss'],
// })
// export class HomePage implements OnInit {
//   private socket: any;
//   private peerConnection: RTCPeerConnection | undefined;
//   private localStream: any;
//   private remoteStream: MediaStream | undefined;

//   public roomId: string = '';
//   public message: string = '';
//   public inCall: boolean = false;

//   private servers = {
//     iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
//   };

//   constructor(private platform: Platform) {}

//   ngOnInit() {
//     this.platform.ready().then(() => {
//       this.initializeSocketConnection();
//     });
//   }

//   private initializeSocketConnection() {
//     try {
//       this.socket = io('http://64.227.191.74:9090', { transports: ['websocket', 'polling'] });

//       this.socket.on('connect', () => {
//         console.log('Socket connected');
//       });

//       this.socket.on('disconnect', () => {
//         console.log('Socket disconnected');
//       });

//       this.socket.on('connect_error', (error: any) => {
//         console.error('Socket connection error:', error);
//       });

//       this.socket.on('offer', async (offer: RTCSessionDescriptionInit) => {
//         console.log('Received offer:', offer);
//         if (this.peerConnection) {
//           try {
//             await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//             const answer = await this.peerConnection.createAnswer();
//             await this.peerConnection.setLocalDescription(answer);
//             this.socket.emit('answer', this.roomId, answer);
//           } catch (error) {
//             console.error('Error handling offer:', error);
//           }
//         }
//       });

//       this.socket.on('answer', async (answer: RTCSessionDescriptionInit) => {
//         console.log('Received answer:', answer);
//         if (this.peerConnection) {
//           try {
//             await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//           } catch (error) {
//             console.error('Error handling answer:', error);
//           }
//         }
//       });

//       this.socket.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
//         console.log('Received ICE candidate:', candidate);
//         if (this.peerConnection) {
//           try {
//             await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//           } catch (error) {
//             console.error('Error adding ICE candidate:', error);
//           }
//         }
//       });

//       this.socket.on('chat-message', (message: string) => {
//         console.log('Received chat message:', message);
//         this.addMessage(`Other: ${message}`);
//       });

//       this.socket.on('user-disconnected', (userId: string) => {
//         console.log(`${userId} disconnected`);
//         this.endCall();
//       });
//     } catch (error) {
//       console.error('Error initializing socket connection:', error);
//     }
//   }

//   async joinCall() {
//     if (!this.roomId) {
//       alert('Please enter a room ID');
//       return;
//     }

//     try {
//       this.socket.emit('join', this.roomId);

//       // Start local media stream with echo cancellation
//       const constraints = {
//         video: true,
//         audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
//       };

//       try {
//         this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
//       } catch (error) {
//         console.error('Error accessing media devices:', error);
//         alert('Unable to access media devices. Please check your permissions and try again.\nError: ' + error);
//         return;
//       }

//       const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
//       if (localVideo) {
//         localVideo.srcObject = this.localStream;
//         localVideo.muted = true; // Mute local video playback to avoid hearing own voice
//       }

//       // Initialize peer connection
//       this.peerConnection = new RTCPeerConnection(this.servers);

//       // Handle ICE candidates
//       this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
//         if (event.candidate) {
//           this.socket.emit('ice-candidate', this.roomId, event.candidate);
//         }
//       };

//       // Handle remote track
//       this.peerConnection.ontrack = (event: RTCTrackEvent) => {
//         if (!this.remoteStream) {
//           this.remoteStream = new MediaStream();
//           const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
//           if (remoteVideo) {
//             remoteVideo.srcObject = this.remoteStream;
//           }
//         }
//         this.remoteStream.addTrack(event.track);
//       };

//       // Add local tracks to peer connection
//       if (this.localStream) {
//         this.localStream.getTracks().forEach((track: MediaStreamTrack) => {
//           this.peerConnection?.addTrack(track, this.localStream);
//         });
//       }

//       // Create and send offer
//       const offer = await this.peerConnection.createOffer();
//       await this.peerConnection.setLocalDescription(offer);
//       this.socket.emit('offer', this.roomId, offer);

//       this.inCall = true;
//     } catch (error) {
//       console.error('Error joining call:', error);
//     }
//   }

//   endCall() {
//     if (this.peerConnection) {
//       this.peerConnection.close();
//       this.peerConnection = undefined;
//     }

//     if (this.localStream) {
//       this.localStream.getTracks().forEach((track: MediaStreamTrack) => {
//         track.stop();
//       });
//       this.localStream = undefined;
//     }

//     if (this.remoteStream) {
//       this.remoteStream.getTracks().forEach((track: MediaStreamTrack) => {
//         track.stop();
//       });
//       this.remoteStream = undefined;
//     }

//     const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
//     const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
//     if (localVideo) localVideo.srcObject = null;
//     if (remoteVideo) remoteVideo.srcObject = null;

//     this.socket.disconnect();
//     this.inCall = false;
//   }

//   sendMessage() {
//     if (this.message) {
//       this.socket.emit('chat-message', this.roomId, this.message);
//       this.addMessage(`You: ${this.message}`);
//       this.message = '';
//     }
//   }

//   addMessage(message: string) {
//     const chatMessages = document.getElementById('chatMessages') as HTMLDivElement;
//     if (chatMessages) {
//       const messageElement = document.createElement('div');
//       messageElement.textContent = message;
//       chatMessages.appendChild(messageElement);
//       chatMessages.scrollTop = chatMessages.scrollHeight;
//     }
//   }
// }




import { Component, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { Platform } from '@ionic/angular';
import io from 'socket.io-client';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  private socket: any;
  private peerConnection: RTCPeerConnection | undefined;
  private localStream: any;
  private remoteStream: MediaStream | undefined;

  public roomId: string = '';
  public message: string = '';
  public inCall: boolean = false;
   @ViewChildren('video') video:any;
  private servers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  constructor(private platform: Platform) {}
    
  ngOnInit() {
    this.platform.ready().then(() => {
      this.initializeSocketConnection();
    });
  }
  private initializeSocketConnection() {
    try {
      this.socket = io('http://localhost:9090', { transports: ['websocket', 'polling'] });
      this.socket.on('connect', () => {
        console.log('Socket connected');
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('Socket connection error:', error);
      });

      this.socket.on('offer', async (offer: RTCSessionDescriptionInit) => {
        console.log('Received offer:', offer);
        if (!this.peerConnection) {
          this.createPeerConnection();
        }
        try {
          await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await this.peerConnection!.createAnswer();
          await this.peerConnection!.setLocalDescription(answer);
          this.socket.emit('answer', this.roomId, answer);
        } catch (error) {
          console.error('Error handling offer:', error);
        }
      });

      this.socket.on('answer', async (answer: RTCSessionDescriptionInit) => {
        console.log('Received answer:', answer);
        if (this.peerConnection) {
          try {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          } catch (error) {
            console.error('Error handling answer:', error);
          }
        }
      });

      this.socket.on('ice-candidate', async (candidate: RTCIceCandidateInit) => {
        console.log('Received ICE candidate:', candidate);
        if (this.peerConnection) {
          try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (error) {
            console.error('Error adding ICE candidate:', error);
          }
        }
      });

      this.socket.on('chat-message', (message: string) => {
        console.log('Received chat message:', message);
        this.addMessage(`Other: ${message}`);
      });

      this.socket.on('user-disconnected', (userId: string) => {
        console.log(`${userId} disconnected`);
        this.endCall();
      });
    } catch (error) {
      console.error('Error initializing socket connection:', error);
    }
  }

  private createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.servers);

    this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', this.roomId, event.candidate);
      }
    };

    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
        const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
        if (remoteVideo) {
          remoteVideo.srcObject = this.remoteStream;
        }
      }
      this.remoteStream.addTrack(event.track);
    };
  }

  async joinCall() {
    if (!this.roomId) {
      alert('Please enter a room ID');
      return;
    }

    try {
      this.socket.emit('join', this.roomId);

      const constraints = {
        video: true,
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      };

      try {
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Unable to access media devices. Please check your permissions and try again.\nError: ' + error);
        return;
      }

      const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
      if (localVideo) {
        localVideo.srcObject = this.localStream;
        localVideo.muted = true; // Mute local video playback to avoid hearing own voice
      }

      if (!this.peerConnection) {
        this.createPeerConnection();
      }

      // Add local tracks to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach((track: MediaStreamTrack) => {
          this.peerConnection?.addTrack(track, this.localStream);
        });
      }

      // Create and send offer
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);
      this.socket.emit('offer', this.roomId, offer);

      this.inCall = true;
    } catch (error) {
      console.error('Error joining call:', error);
    }
  }

  endCall() {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = undefined;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
      this.localStream = undefined;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
      this.remoteStream = undefined;
    }

    const localVideo = document.getElementById('localVideo') as HTMLVideoElement;
    const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
    if (localVideo) localVideo.srcObject = null;
    if (remoteVideo) remoteVideo.srcObject = null;

    this.socket.disconnect();
    this.inCall = false;
  }

  sendMessage() {
    if (this.message) {
      this.socket.emit('chat-message', this.roomId, this.message);
      this.addMessage(`You: ${this.message}`);
      this.message = '';
    }
  }

  addMessage(message: string) {
    const chatMessages = document.getElementById('chatMessages') as HTMLDivElement;
    if (chatMessages) {
      const messageElement = document.createElement('div');
      messageElement.textContent = message;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
}
