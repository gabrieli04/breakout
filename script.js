class Jogador {
    constructor(x, y, largura, altura) {
      this.x = x;
      this.y = y;
      this.largura = largura;
      this.altura = altura;
      this.velocidade = 10;
    }
  
    desenhar(ctx) {
      ctx.fillStyle = "#00FF00"; // Verde vibrante
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00FF00";
      ctx.fillRect(this.x, this.y, this.largura, this.altura);
      ctx.shadowBlur = 0; // Reseta a sombra
    }
  
    mover(direcao) {
      if (direcao === "esquerda" && this.x > 0) {
        this.x -= this.velocidade;
      } else if (direcao === "direita" && this.x + this.largura < ctx.canvas.width) {
        this.x += this.velocidade;
      }
    }
  }
  
  class Bola {
    constructor(x, y, raio) {
      this.x = x;
      this.y = y;
      this.raio = raio;
      this.velocidadeX = 5;
      this.velocidadeY = -5;
      this.iniciada = false;
    }
  
    desenhar(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
      ctx.fillStyle = "#FF0000"; // Vermelho vibrante
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#FF0000";
      ctx.fill();
      ctx.closePath();
      ctx.shadowBlur = 0; // Reseta a sombra
    }
  
    mover() {
      if (this.iniciada) {
        this.x += this.velocidadeX;
        this.y += this.velocidadeY;
      }
    }
  
    colisaoParede(larguraCanvas, alturaCanvas) {
      if (this.x + this.raio > larguraCanvas || this.x - this.raio < 0) {
        this.velocidadeX = -this.velocidadeX;
      }
      if (this.y - this.raio < 0) {
        this.velocidadeY = -this.velocidadeY;
      }
    }
  
    colisaoRaquete(raquete) {
      if (
        this.x + this.raio > raquete.x &&
        this.x - this.raio < raquete.x + raquete.largura &&
        this.y + this.raio > raquete.y
      ) {
        this.velocidadeY = -this.velocidadeY;
      }
    }
  
    colisaoBloco(bloco) {
      if (
        this.x + this.raio > bloco.x &&
        this.x - this.raio < bloco.x + bloco.largura &&
        this.y + this.raio > bloco.y &&
        this.y - this.raio < bloco.y + bloco.altura &&
        bloco.vivo
      ) {
        this.velocidadeY = -this.velocidadeY;
        bloco.colidir();
        return true;
      }
      return false;
    }
  }
  
  class Bloco {
    constructor(x, y, largura, altura) {
      this.x = x;
      this.y = y;
      this.largura = largura;
      this.altura = altura;
      this.vivo = true;
    }
  
    desenhar(ctx) {
      if (this.vivo) {
        ctx.fillStyle = "#0000FF";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#0000FF";
        ctx.fillRect(this.x, this.y, this.largura, this.altura);
        ctx.shadowBlur = 0; 
      }
    }
  
    colidir() {
      this.vivo = false;
    }
  }
  
  class Jogo {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.jogador = new Jogador(350, 550, 100, 20);
      this.bola = new Bola(400, 300, 10);
      this.blocos = [];
      this.pontuacao = 0;
      this.gameOver = false;
      this.recorde = localStorage.getItem("recorde") || 0;
      this.inicializar();
  
      this.canvas.addEventListener("click", () => {
        if (!this.bola.iniciada) {
          this.bola.iniciada = true;
        }
      });
  
      
      this.reiniciarBtn = document.getElementById("reiniciar-btn");
      this.reiniciarBtn.addEventListener("click", () => {
        location.reload(); 
      });
  
     
      document.getElementById("recorde").textContent = this.recorde;
    }
  
    inicializar() {
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 8; j++) {
          this.blocos.push(new Bloco(j * 100, i * 50, 80, 30));
        }
      }
    }
  
    atualizar() {
      if (this.gameOver) return; 
      this.bola.mover();
      this.bola.colisaoParede(this.canvas.width, this.canvas.height);
      this.bola.colisaoRaquete(this.jogador);
  
      for (let bloco of this.blocos) {
        if (this.bola.colisaoBloco(bloco)) {
          this.pontuacao += 10;
          document.getElementById("pontuacao").textContent = this.pontuacao; 
        }
      }
  
     
      if (this.bola.y + this.bola.raio > this.canvas.height) {
        this.gameOver = true; 
        this.mostrarGameOver();
      }
    }
  
    mostrarGameOver() {
      if (this.pontuacao > this.recorde) {
        this.recorde = this.pontuacao;
        localStorage.setItem("recorde", this.recorde); // Salva o recorde no localStorage
        document.getElementById("recorde").textContent = this.recorde;
      }
  
      this.reiniciarBtn.classList.add("visible");
  
      cancelAnimationFrame(this.loopId);
    }
  
    renderizar() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
      this.jogador.desenhar(this.ctx);
      this.bola.desenhar(this.ctx);
      for (let bloco of this.blocos) {
        bloco.desenhar(this.ctx);
      }
  
     
      if (this.gameOver) {
        this.ctx.fillStyle = "white";
        this.ctx.font = "40px 'Press Start 2P', cursive";
        this.ctx.textAlign = "center";
        this.ctx.fillText("Game Over", this.canvas.width / 2, this.canvas.height / 2 - 30);
        this.ctx.font = "20px 'Press Start 2P', cursive";
        this.ctx.fillText(`Pontuação Final: ${this.pontuacao}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
      }
    }
  
    loop() {
      this.atualizar();
      this.renderizar();
      if (!this.gameOver) {
        this.loopId = requestAnimationFrame(() => this.loop());
      }
    }
  }
  
  const canvas = document.getElementById("canvas");
  const jogo = new Jogo(canvas);
  jogo.loop();
  
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      jogo.jogador.mover("esquerda");
    } else if (e.key === "ArrowRight") {
      jogo.jogador.mover("direita");
    }
  });