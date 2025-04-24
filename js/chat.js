  // Global variables and functions
  const chatMessages = document.getElementById('chat-messages');
        
  window.copyMessage = async function(button) {
      try {
          const messageContent = button.closest('.message').querySelector('.message-content');
          const text = messageContent.innerText || messageContent.textContent;
          await navigator.clipboard.writeText(text);
          const icon = button.querySelector('i');
          icon.className = 'fas fa-check';
          setTimeout(() => icon.className = 'fas fa-copy', 2000);
      } catch (err) {
          console.error('Failed to copy text:', err);
          alert('Failed to copy text. Please try again.');
      }
  };

  window.readMessage = function(button) {
      try {
          const messageContent = button.closest('.message').querySelector('.message-content');
          const text = messageContent.innerText || messageContent.textContent;
          const utterance = new SpeechSynthesisUtterance(text);
          window.speechSynthesis.speak(utterance);
      } catch (err) {
          console.error('Failed to read text:', err);
          alert('Failed to read text. Please try again.');
      }
  };

  (function() {
      const widget = document.querySelector('.chat-widget');
      const messageInput = document.getElementById('message-input');
      const sendButton = document.getElementById('send-button');
      const typingIndicator = document.getElementById('typing-indicator');
      const voiceButton = document.getElementById('voice-input');
      const chatIconButton = document.getElementById('chat-icon-button');
      const chatContainer = document.querySelector('.chat-container');

      // Theme handling
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
      widget.classList.toggle('dark-theme', isDark);
      widget.setAttribute('data-theme', isDark ? 'dark' : 'light');

      function toggleTheme() {
          const isDark = widget.classList.toggle('dark-theme');
          widget.setAttribute('data-theme', isDark ? 'dark' : 'light');
          localStorage.setItem('theme', isDark ? 'dark' : 'light');
      }

      document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);

      // Chat functionality
      function addMessage(text, isBot = false) {
          const messageDiv = document.createElement('div');
          messageDiv.className = `message ${isBot ? 'bot-message' : 'user-message'}`;
          messageDiv.innerHTML = `
              <div class="message-content">${text}</div>
              <div class="message-meta">
                  <div class="message-timestamp">
                      <i class="fas fa-clock"></i>
                      <span>${new Date().toLocaleTimeString()}</span>
                  </div>
                  <div class="message-actions">
                      <button class="action-btn" onclick="copyMessage(this)" title="Copy message">
                          <i class="fas fa-copy"></i>
                      </button>
                      <button class="action-btn" onclick="readMessage(this)" title="Read aloud">
                          <i class="fas fa-volume-up"></i>
                      </button>
                  </div>
              </div>
          `;
          chatMessages.appendChild(messageDiv);
          setTimeout(() => messageDiv.classList.add('show'), 100);
          chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      async function sendMessage() {
          const message = messageInput.value.trim();
          if (!message) return;
          addMessage(message, false);
          messageInput.value = '';
          typingIndicator.style.display = 'inline-flex';
          try {
              const response = await puter.ai.chat(message);
              typingIndicator.style.display = 'none';
              addMessage(response, true);
          } catch (error) {
              typingIndicator.style.display = 'none';
              addMessage("Sorry, something went wrong.", true);
          }
      }

      // Voice input
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = SpeechRecognition ? new SpeechRecognition() : null;
      if (recognition) {
          recognition.onresult = (event) => {
              messageInput.value = event.results[0][0].transcript;
              voiceButton.classList.remove('recording');
              sendMessage();
          };
          voiceButton.addEventListener('click', () => {
              if (voiceButton.classList.contains('recording')) {
                  recognition.stop();
                  voiceButton.classList.remove('recording');
              } else {
                  recognition.start();
                  voiceButton.classList.add('recording');
              }
          });
      }

      // Chat toggle
      function toggleChat() {
          const isShowing = chatContainer.classList.contains('show');
          if (!isShowing) {
              chatContainer.style.display = 'flex';
              chatContainer.classList.add('show');
              chatIconButton.classList.add('open');
          } else {
              chatContainer.classList.remove('show');
              chatIconButton.classList.remove('open');
              setTimeout(() => {
                  if (!chatContainer.classList.contains('show')) {
                      chatContainer.style.display = 'none';
                  }
              }, 300);
          }
      }

      chatIconButton.addEventListener('click', toggleChat);
      sendButton.addEventListener('click', sendMessage);
      messageInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') sendMessage();
      });

      // Particles
      particlesJS('particles', {
          particles: {
              number: { value: 30 },
              color: { value: '#ffffff' },
              shape: { type: 'circle' },
              opacity: { value: 0.1 },
              size: { value: 3 },
              move: { enable: true, speed: 1 }
          },
          interactivity: {
              events: { onHover: { enable: true, mode: 'repulse' } }
          }
      });

      // Welcome animation
      setTimeout(() => {
          document.getElementById('welcome-animation').style.display = 'none';
      }, 2000);

      // Initial state
      chatContainer.style.display = 'none';

      document.addEventListener('DOMContentLoaded', function () {
          var closeBtn = document.getElementById('chat-close-btn');
          var chatContainer = document.querySelector('.chat-widget');
          if (closeBtn && chatContainer) {
              closeBtn.addEventListener('click', function () {
                  chatContainer.style.display = 'none';
              });
          }
      });
  })();