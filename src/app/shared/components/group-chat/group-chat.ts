import { Component, inject, OnInit, signal, computed, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessageDto } from '../../services/chat/chat-service';
import { Spiner } from '../movil/spiner/spiner';
import { UserProfile } from '../../models/profile.model';

@Component({
  selector: 'app-group-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Spiner],
  templateUrl: './group-chat.html'
})
export class GroupChat implements OnInit, AfterViewChecked {
  private route = inject(ActivatedRoute);
  private chatService = inject(ChatService);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  groupId: string = '';
  conversationId: string | null = null;
  
  isLoading = signal(true);
  isUploading = signal(false); 
  messageText = '';
  user?: UserProfile; 
  
  messages = computed(() => 
    this.chatService.messages()
      .slice()
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((m: ChatMessageDto) => ({
        id: m.id,
        text: m.body,
        isMe: m.is_me,
        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: m.sender?.display_name || 'Usuario',
        image: m.image_url
      }))
  );

  ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.user = JSON.parse(userJson);
    }

    if (this.groupId) {
      this.findConversationAndLoad();
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  findConversationAndLoad() {
    const orgId = localStorage.getItem('selectedOrganizationId') || '';
    
    this.chatService.getConversationsByOrganization(orgId).subscribe({
      next: (convs) => {
        const groupConv = convs.find(c => c.type === 'group' && c.group?.id === this.groupId);
        
        if (groupConv) {
          this.conversationId = groupConv.id;
          this.loadMessages();
        } else {
          this.createGroupConversation();
        }
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  createGroupConversation() {
    this.chatService.startGroupConversation(this.groupId).subscribe({
      next: (conv) => {
        this.conversationId = conv.id;
        this.loadMessages();
      },
      error: (err) => {
        console.error('Error creando conversación de grupo', err);
        this.isLoading.set(false);
      }
    });
  }

  loadMessages() {
    if (!this.conversationId) return;

    this.chatService.loadMessages(this.conversationId).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.scrollToBottom();
      },
      error: () => this.isLoading.set(false)
    });
  }

  sendMessage() {
    if (!this.messageText.trim() || !this.conversationId) return;

    this.chatService.sendMessage(this.conversationId, this.messageText).subscribe({
      next: () => {
        this.messageText = '';
        this.scrollToBottom();
      },
      error: (err) => console.error('Error enviando mensaje', err)
    });
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  async onFileSelected(event: Event) {
    if (!this.conversationId) return;

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.isUploading.set(true); 

    try {
      const imageUrl = await this.chatService.uploadChatImage(
        this.conversationId,
        this.user?.profile?.id || '',
        file
      );

      this.chatService.sendMessage(this.conversationId, '', imageUrl).subscribe({
        next: () => {
          this.isUploading.set(false);
          input.value = ''; 
          this.scrollToBottom();
        },
        error: (err) => {
          console.error('Error enviando imagen', err);
          this.isUploading.set(false);
        }
      });

    } catch (err) {
      console.error('Error subiendo imagen', err);
      this.isUploading.set(false);
    }
  }
}
