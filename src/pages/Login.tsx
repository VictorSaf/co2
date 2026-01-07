import { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { submitAccessRequest } from '../services/accessRequestService';
import { Tooltip, Input } from '../design-system';

type ModalType = 'login' | 'register' | null;

// Canvas animation classes
class CO2Molecule {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  pulsePhase: number;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.scale = 0.3 + Math.random() * 0.4;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.01;
    this.opacity = 0.08 + Math.random() * 0.12;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.rotation += this.rotationSpeed;
    this.pulsePhase += 0.02;

    if (this.x < -50) this.x = this.width + 50;
    if (this.x > this.width + 50) this.x = -50;
    if (this.y < -50) this.y = this.height + 50;
    if (this.y > this.height + 50) this.y = -50;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    const pulse = 1 + Math.sin(this.pulsePhase) * 0.1;

    ctx.beginPath();
    ctx.arc(0, 0, 12 * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(45, 212, 191, ${this.opacity})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-30, 0, 8 * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.6})`;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(30, 0, 8 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-18, -2);
    ctx.lineTo(-12, -2);
    ctx.moveTo(-18, 2);
    ctx.lineTo(-12, 2);
    ctx.moveTo(12, -2);
    ctx.lineTo(18, -2);
    ctx.moveTo(12, 2);
    ctx.lineTo(18, 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity * 0.3})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();
  }
}

class DataParticle {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
  isGreen: boolean;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.width;
    this.y = this.height + 10;
    this.speed = 0.2 + Math.random() * 0.5;
    this.size = 1 + Math.random() * 2;
    this.opacity = 0.08 + Math.random() * 0.15;
    this.isGreen = Math.random() > 0.3;
  }

  update() {
    this.y -= this.speed;
    if (this.y < -10) this.reset();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    if (this.isGreen) {
      ctx.fillStyle = `rgba(45, 212, 191, ${this.opacity})`;
    } else {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.5})`;
    }
    ctx.fill();
  }
}

class ChartLine {
  yBase: number;
  amplitude: number;
  speed: number;
  opacity: number;
  offset: number;
  points: Array<{ x: number; y: number }>;
  width: number;
  time: number;

  constructor(yBase: number, amplitude: number, speed: number, opacity: number, width: number) {
    this.yBase = yBase;
    this.amplitude = amplitude;
    this.speed = speed;
    this.opacity = opacity;
    this.offset = Math.random() * 1000;
    this.points = [];
    this.width = width;
    this.time = 0;
  }

  update(time: number) {
    this.time = time;
    this.points = [];
    for (let x = 0; x < this.width + 20; x += 3) {
      const noise1 = Math.sin((x + time * this.speed + this.offset) * 0.01) * this.amplitude;
      const noise2 = Math.sin((x + time * this.speed * 0.7 + this.offset) * 0.02) * this.amplitude * 0.5;
      const noise3 = Math.sin((x + time * this.speed * 1.3 + this.offset) * 0.005) * this.amplitude * 2;
      const y = this.yBase + noise1 + noise2 + noise3;
      this.points.push({ x, y });
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);

    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }

    ctx.strokeStyle = `rgba(45, 212, 191, ${this.opacity})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = `rgba(45, 212, 191, ${this.opacity * 0.3})`;
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

// Ecology canvas classes
class Leaf {
  x: number;
  y: number;
  originX: number;
  originY: number;
  size: number;
  angle: number;
  speed: number;
  amplitude: number;
  opacity: number;
  hue: number;
  pulseSpeed: number;
  pulsePhase: number;

  constructor(x: number, y: number, size?: number) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.size = size || 2 + Math.random() * 4;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = 0.01 + Math.random() * 0.02;
    this.amplitude = 5 + Math.random() * 10;
    this.opacity = 0.2 + Math.random() * 0.4;
    this.hue = 150 + Math.random() * 30;
    this.pulseSpeed = 0.02 + Math.random() * 0.02;
    this.pulsePhase = Math.random() * Math.PI * 2;
  }

  update() {
    this.angle += this.speed;
    this.pulsePhase += this.pulseSpeed;
    this.x = this.originX + Math.sin(this.angle) * this.amplitude;
    this.y = this.originY + Math.cos(this.angle * 0.7) * this.amplitude * 0.5;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const pulse = 1 + Math.sin(this.pulsePhase) * 0.3;
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.size * pulse
    );
    gradient.addColorStop(0, `hsla(${this.hue}, 70%, 55%, ${this.opacity})`);
    gradient.addColorStop(0.5, `hsla(${this.hue}, 60%, 45%, ${this.opacity * 0.5})`);
    gradient.addColorStop(1, `hsla(${this.hue}, 50%, 35%, 0)`);

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * pulse * 2, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

class EcoParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  phase: number;
  hue: number;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.width * 0.4;
    this.y = this.height + 10;
    this.vx = 0.2 + Math.random() * 0.3;
    this.vy = -0.3 - Math.random() * 0.5;
    this.size = 1 + Math.random() * 2;
    this.opacity = 0.1 + Math.random() * 0.25;
    this.wobbleSpeed = 0.02 + Math.random() * 0.03;
    this.wobbleAmp = 20 + Math.random() * 30;
    this.phase = Math.random() * Math.PI * 2;
    this.hue = 140 + Math.random() * 40;
  }

  update() {
    this.phase += this.wobbleSpeed;
    this.x += this.vx + Math.sin(this.phase) * 0.5;
    this.y += this.vy;

    if (this.y < -20 || this.x > this.width * 0.6) {
      this.reset();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 60%, 50%, ${this.opacity})`;
    ctx.fill();
  }
}

class Branch {
  startX: number;
  startY: number;
  angle: number;
  length: number;
  depth: number;
  maxDepth: number;
  progress: number;
  growSpeed: number;
  children: Branch[];
  hasSpawned: boolean;
  swayPhase: number;
  swaySpeed: number;
  swayAmount: number;
  width: number;
  height: number;

  constructor(
    startX: number,
    startY: number,
    angle: number,
    length: number,
    depth: number,
    maxDepth: number,
    width: number,
    height: number
  ) {
    this.startX = startX;
    this.startY = startY;
    this.angle = angle;
    this.length = length;
    this.depth = depth;
    this.maxDepth = maxDepth;
    this.progress = 0;
    this.growSpeed = 0.008 + Math.random() * 0.005;
    this.children = [];
    this.hasSpawned = false;
    this.swayPhase = Math.random() * Math.PI * 2;
    this.swaySpeed = 0.01 + Math.random() * 0.01;
    this.swayAmount = 0.02 + Math.random() * 0.03;
    this.width = width;
    this.height = height;
  }

  update(leaves: Leaf[], branches: Branch[]) {
    if (this.progress < 1) {
      this.progress += this.growSpeed;
    }

    this.swayPhase += this.swaySpeed;

    if (this.progress > 0.7 && !this.hasSpawned && this.depth < this.maxDepth) {
      this.hasSpawned = true;
      const endX = this.getEndX();
      const endY = this.getEndY();

      const numChildren = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < numChildren; i++) {
        const newAngle = this.angle + (Math.random() - 0.5) * 1.2;
        const newLength = this.length * (0.6 + Math.random() * 0.3);
        const child = new Branch(
          endX,
          endY,
          newAngle,
          newLength,
          this.depth + 1,
          this.maxDepth,
          this.width,
          this.height
        );
        this.children.push(child);
        branches.push(child);

        if (this.depth >= this.maxDepth - 2) {
          for (let j = 0; j < 3 + Math.floor(Math.random() * 4); j++) {
            const leafX = endX + (Math.random() - 0.5) * 30;
            const leafY = endY + (Math.random() - 0.5) * 30;
            leaves.push(new Leaf(leafX, leafY));
          }
        }
      }
    }

    this.children.forEach((c) => c.update(leaves, branches));
  }

  getCurrentAngle() {
    return this.angle + Math.sin(this.swayPhase) * this.swayAmount;
  }

  getEndX() {
    return this.startX + Math.cos(this.getCurrentAngle()) * this.length * this.progress;
  }

  getEndY() {
    return this.startY + Math.sin(this.getCurrentAngle()) * this.length * this.progress;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.progress <= 0) return;

    const endX = this.getEndX();
    const endY = this.getEndY();

    const thickness = Math.max(0.5, (this.maxDepth - this.depth) * 1.5) * this.progress;

    ctx.beginPath();
    ctx.moveTo(this.startX, this.startY);

    const midX = (this.startX + endX) / 2 + Math.sin(this.swayPhase * 2) * 5;
    const midY = (this.startY + endY) / 2;
    ctx.quadraticCurveTo(midX, midY, endX, endY);

    const opacity = 0.15 + (this.depth / this.maxDepth) * 0.15;
    const hue = 150 + this.depth * 5;
    ctx.strokeStyle = `hsla(${hue}, 50%, 40%, ${opacity})`;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.stroke();

    if (this.depth < 3) {
      ctx.strokeStyle = `hsla(${hue}, 60%, 45%, ${opacity * 0.3})`;
      ctx.lineWidth = thickness * 3;
      ctx.stroke();
    }
  }
}

export default function Login() {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [entity, setEntity] = useState('');
  const [contact, setContact] = useState('');
  const [position, setPosition] = useState('');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingAccess, setIsSubmittingAccess] = useState(false);
  const [isAnimationsPaused, setIsAnimationsPaused] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    entity: string;
    contact: string;
    position: string;
    reference: string;
  } | null>(null);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const ecologyCanvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundAnimationRef = useRef<number>();
  const ecologyAnimationRef = useRef<number>();
  
  // Input refs for focus management
  const usernameInputRef = useRef<HTMLInputElement>(null);
  const entityInputRef = useRef<HTMLInputElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Background canvas animation
  useEffect(() => {
    const canvas = backgroundCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let time = 0;
    let molecules: CO2Molecule[] = [];
    let particles: DataParticle[] = [];
    let chartLines: ChartLine[] = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      init();
    };

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.012)';
      ctx.lineWidth = 0.5;

      for (let y = 0; y < height; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      for (let x = 0; x < width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    };

    const init = () => {
      molecules = [];
      particles = [];
      chartLines = [];

      for (let i = 0; i < 8; i++) {
        molecules.push(new CO2Molecule(width, height));
      }

      for (let i = 0; i < 30; i++) {
        const p = new DataParticle(width, height);
        p.y = Math.random() * height;
        particles.push(p);
      }

      chartLines.push(new ChartLine(height * 0.3, 30, 30, 0.06, width));
      chartLines.push(new ChartLine(height * 0.5, 40, 25, 0.04, width));
      chartLines.push(new ChartLine(height * 0.7, 25, 35, 0.05, width));
    };

    const animate = () => {
      if (isAnimationsPaused) {
        backgroundAnimationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.fillStyle = 'rgba(10, 10, 12, 0.1)';
      ctx.fillRect(0, 0, width, height);

      time++;

      drawGrid();

      chartLines.forEach((line) => {
        line.update(time);
        line.draw(ctx);
      });

      molecules.forEach((mol) => {
        mol.update();
        mol.draw(ctx);
      });

      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      backgroundAnimationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (backgroundAnimationRef.current) {
        cancelAnimationFrame(backgroundAnimationRef.current);
      }
    };
  }, [isAnimationsPaused]);

  // Ecology canvas animation
  useEffect(() => {
    const canvas = ecologyCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let ecoTime = 0;
    let branches: Branch[] = [];
    let leaves: Leaf[] = [];
    let floatingParticles: EcoParticle[] = [];

    const ecoResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initEcology();
    };

    const initEcology = () => {
      branches = [];
      leaves = [];
      floatingParticles = [];

      const startX = width * 0.08;
      const startY = height * 0.95;
      const mainAngle = -Math.PI / 2 + 0.3;
      const mainLength = height * 0.25;

      const trunk = new Branch(
        startX,
        startY,
        mainAngle,
        mainLength,
        0,
        6,
        width,
        height
      );
      branches.push(trunk);

      for (let i = 0; i < 10; i++) {
        const lx = startX + Math.random() * 40;
        const ly = startY - Math.random() * 50;
        leaves.push(new Leaf(lx, ly, 3 + Math.random() * 3));
      }

      for (let i = 0; i < 25; i++) {
        const p = new EcoParticle(width, height);
        p.y = Math.random() * height;
        floatingParticles.push(p);
      }
    };

    const drawEnergyFlow = () => {
      for (let i = 0; i < 3; i++) {
        const baseY = height * (0.7 + i * 0.1);
        ctx.beginPath();
        ctx.moveTo(0, baseY);

        for (let x = 0; x < width * 0.3; x += 5) {
          const y = baseY + Math.sin((x + ecoTime * 0.5 + i * 100) * 0.02) * 15;
          ctx.lineTo(x, y);
        }

        const gradient = ctx.createLinearGradient(0, baseY, width * 0.3, baseY);
        gradient.addColorStop(0, 'hsla(160, 50%, 40%, 0.08)');
        gradient.addColorStop(0.5, 'hsla(150, 60%, 45%, 0.04)');
        gradient.addColorStop(1, 'hsla(140, 50%, 40%, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const animateEcology = () => {
      if (isAnimationsPaused) {
        ecologyAnimationRef.current = requestAnimationFrame(animateEcology);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      ecoTime++;

      branches.forEach((b) => {
        b.update(leaves, branches);
        b.draw(ctx);
      });

      leaves.forEach((leaf) => {
        leaf.update();
        leaf.draw(ctx);
      });

      floatingParticles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      drawEnergyFlow();

      ecologyAnimationRef.current = requestAnimationFrame(animateEcology);
    };

    window.addEventListener('resize', ecoResize);
    ecoResize();
    animateEcology();

    return () => {
      window.removeEventListener('resize', ecoResize);
      if (ecologyAnimationRef.current) {
        cancelAnimationFrame(ecologyAnimationRef.current);
      }
    };
  }, [isAnimationsPaused]);

  // Pause animations when modals are open
  useEffect(() => {
    setIsAnimationsPaused(modalType !== null);
  }, [modalType]);

  // Focus management - auto-focus first input when modal opens
  useEffect(() => {
    if (modalType === 'login' && usernameInputRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        usernameInputRef.current?.focus();
      }, 100);
    } else if (modalType === 'register' && entityInputRef.current) {
      setTimeout(() => {
        entityInputRef.current?.focus();
      }, 100);
    }
  }, [modalType]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalType) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [modalType]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        setModalType(null);
        navigate('/dashboard');
      } else {
        setError(t('invalidCredentials'));
      }
    } catch {
      setError(t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessRequest = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate required fields
    if (!entity.trim()) {
      setError(t('requiredField') + ': ' + t('entity'));
      return;
    }

    if (!contact.trim()) {
      setError(t('requiredField') + ': ' + t('contact'));
      return;
    }

    if (!position.trim()) {
      setError(t('requiredField') + ': ' + t('position'));
      return;
    }

    if (!reference.trim()) {
      setError(t('requiredField') + ': ' + t('reference'));
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.trim())) {
      setError(t('invalidEmail'));
      return;
    }

    // Show confirmation screen instead of submitting immediately
    setConfirmationData({
      entity: entity.trim(),
      contact: contact.trim(),
      position: position.trim(),
      reference: reference.trim(),
    });
    setShowConfirmation(true);
  };

  const handleConfirmationSubmit = async () => {
    if (!confirmationData) return;

    setIsSubmittingAccess(true);
    setError('');
    setSuccessMessage('');

    try {
      await submitAccessRequest({
        entity: confirmationData.entity,
        contact: confirmationData.contact,
        position: confirmationData.position,
        reference: confirmationData.reference,
      });

      // Success - show success message
      setSuccessMessage(t('willContactSoon'));
      setError('');
      
      // Close modal and reset form after showing success message
      setTimeout(() => {
        setModalType(null);
        setEntity('');
        setContact('');
        setPosition('');
        setReference('');
        setSuccessMessage('');
        setShowConfirmation(false);
        setConfirmationData(null);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('accessRequestError'));
      setSuccessMessage('');
    } finally {
      setIsSubmittingAccess(false);
    }
  };

  const handleEdit = () => {
    if (confirmationData) {
      setEntity(confirmationData.entity);
      setContact(confirmationData.contact);
      setPosition(confirmationData.position);
      setReference(confirmationData.reference);
    }
    // Clear error when returning to form (user can fix issues)
    setError('');
    setShowConfirmation(false);
    setConfirmationData(null);
  };

  const openModal = (type: ModalType) => {
    setModalType(type);
    setError('');
    setSuccessMessage('');
  };

  const closeModal = () => {
    setModalType(null);
    setError('');
    setSuccessMessage('');
    setUsername('');
    setPassword('');
    setEntity('');
    setContact('');
    setPosition('');
    setReference('');
    setShowConfirmation(false);
    setConfirmationData(null);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0a0a0c] text-[rgba(255,255,255,0.85)] font-['Inter',sans-serif]">
      {/* Canvas Backgrounds */}
      <canvas
        ref={backgroundCanvasRef}
        className="fixed top-0 left-0 w-full h-full z-0"
      />
      <canvas
        ref={ecologyCanvasRef}
        className="fixed top-0 left-0 w-full h-full z-[1] pointer-events-none"
      />

      {/* Gradient Overlay */}
      <div
        className="fixed inset-0 z-[2] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 15% 85%, rgba(16, 185, 129, 0.12) 0%, transparent 45%),
            radial-gradient(ellipse at 80% 20%, rgba(45, 212, 191, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(10, 10, 12, 0.7) 0%, transparent 100%)
          `,
        }}
      />

      {/* Scanlines */}
      <div
        className="fixed inset-0 z-[4] pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.02) 2px,
            rgba(0, 0, 0, 0.02) 4px
          )`,
        }}
      />

      {/* Brand Watermark */}
      <div className="fixed bottom-[8%] right-[6%] z-[5] pointer-events-none opacity-0 animate-[fadeInBrand_3s_ease-out_1s_forwards]">
        <h1
          className="text-[clamp(2.5rem,6vw,5rem)] font-light tracking-[0.5em] uppercase relative"
          style={{
            color: 'transparent',
            background: `linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.25) 0%,
              rgba(45, 212, 191, 0.4) 50%,
              rgba(16, 185, 129, 0.2) 100%
            )`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            textShadow: '0 0 80px rgba(45, 212, 191, 0.15)',
          }}
        >
          Nihao Group
        </h1>
      </div>

      {/* Main Container */}
      <div className="relative z-[10] flex flex-col items-center justify-center min-h-screen gap-16">
        {/* Logo Area */}
        <div className="text-center opacity-0 animate-[fadeInUp_1s_ease-out_0.3s_forwards]">
          <div className="w-[60px] h-[60px] mx-auto mb-6 relative">
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="30" r="8" stroke="rgba(45, 212, 191, 0.4)" strokeWidth="0.5" fill="none">
                <animate attributeName="r" values="8;10;8" dur="6s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity" values="0.4;0.15;0.4" dur="6s" repeatCount="indefinite" />
              </circle>
              <circle cx="14" cy="30" r="5" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" fill="none">
                <animate attributeName="r" values="5;6;5" dur="5s" repeatCount="indefinite" />
              </circle>
              <circle cx="46" cy="30" r="5" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" fill="none">
                <animate attributeName="r" values="5;6;5" dur="5s" repeatCount="indefinite" begin="0.5s" />
              </circle>
              <line x1="22" y1="30" x2="19" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
              <line x1="38" y1="30" x2="41" y2="30" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            </svg>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 w-[220px] opacity-0 animate-[fadeInUp_1s_ease-out_0.6s_forwards]">
          <button
            onClick={() => openModal('login')}
            className="relative px-8 py-4 border-none bg-transparent text-[rgba(255,255,255,0.5)] text-[0.7rem] font-light tracking-[0.2em] uppercase cursor-pointer overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-[rgba(255,255,255,0.85)]"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(45, 212, 191, 0.05)',
            }}
          >
            <span className="relative z-[1]">{t('enter')}</span>
          </button>
          <button
            onClick={() => openModal('register')}
            className="relative px-8 py-4 border-none bg-transparent text-[rgba(255,255,255,0.5)] text-[0.7rem] font-light tracking-[0.2em] uppercase cursor-pointer overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-[rgba(255,255,255,0.85)]"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <span className="relative z-[1]">{t('requestAccess')}</span>
          </button>
        </div>
      </div>

      {/* Login Modal */}
      {modalType === 'login' && (
        <div
          className="fixed inset-0 bg-[rgba(10,10,12,0.95)] z-[100] flex items-center justify-center transition-all duration-400 ease-in-out backdrop-blur-[10px]"
          style={{
            opacity: modalType === 'login' ? 1 : 0,
            visibility: modalType === 'login' ? 'visible' : 'hidden',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="bg-[#12121a] border border-[rgba(255,255,255,0.12)] p-12 w-[90%] max-w-[380px] relative transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ transform: 'translateY(0)' }}
          >
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 w-8 h-8 bg-transparent border-none cursor-pointer opacity-40 hover:opacity-100 transition-opacity duration-300"
            >
              <span
                className="absolute top-1/2 left-1/2 w-4 h-[1px] bg-[rgba(255,255,255,0.85)]"
                style={{
                  transform: 'translate(-50%, -50%) rotate(45deg)',
                }}
              />
              <span
                className="absolute top-1/2 left-1/2 w-4 h-[1px] bg-[rgba(255,255,255,0.85)]"
                style={{
                  transform: 'translate(-50%, -50%) rotate(-45deg)',
                }}
              />
            </button>

            <div className="text-center mb-10">
              <h2 className="text-[0.7rem] tracking-[0.4em] text-[rgba(255,255,255,0.4)] uppercase font-light">
                {t('authenticate')}
              </h2>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <input
                  ref={usernameInputRef}
                  type="text"
                  placeholder={t('username')}
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.85)] text-[0.85rem] tracking-[0.05em] transition-all duration-300 focus:outline-none focus:border-[#14b8a6] focus:bg-[rgba(255,255,255,0.06)] placeholder:text-[rgba(255,255,255,0.4)] placeholder:text-[0.7rem] placeholder:uppercase placeholder:tracking-[0.2em]"
                />
              </div>
              <div className="mb-6">
                <input
                  type="password"
                  placeholder={t('password')}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.85)] text-[0.85rem] tracking-[0.05em] transition-all duration-300 focus:outline-none focus:border-[#14b8a6] focus:bg-[rgba(255,255,255,0.06)] placeholder:text-[rgba(255,255,255,0.4)] placeholder:text-[0.7rem] placeholder:uppercase placeholder:tracking-[0.2em]"
                />
              </div>

              {error && (
                <div className="mb-4 text-sm text-red-400" role="alert">
                  {error}
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3.5 text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.6)] transition-colors duration-300 border border-[rgba(255,255,255,0.06)] bg-transparent text-[0.7rem] font-light tracking-[0.2em] uppercase cursor-pointer"
                >
                  <span>{t('cancel')}</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-3.5 bg-gradient-to-br from-[rgba(45,212,191,0.15)] to-[rgba(16,185,129,0.1)] border border-[rgba(45,212,191,0.3)] text-[rgba(255,255,255,0.85)] text-[0.7rem] font-light tracking-[0.2em] uppercase cursor-pointer transition-all duration-300 hover:from-[rgba(45,212,191,0.25)] hover:to-[rgba(16,185,129,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isLoading ? t('loading') : t('proceed')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {modalType === 'register' && (
        <div
          className="fixed inset-0 bg-[rgba(10,10,12,0.95)] z-[100] flex items-center justify-center transition-all duration-400 ease-in-out backdrop-blur-[10px]"
          style={{
            opacity: modalType === 'register' ? 1 : 0,
            visibility: modalType === 'register' ? 'visible' : 'hidden',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="bg-[#12121a] border border-[rgba(255,255,255,0.12)] p-12 w-[90%] max-w-[380px] relative transition-transform duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ transform: 'translateY(0)' }}
          >
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 w-8 h-8 bg-transparent border-none cursor-pointer opacity-40 hover:opacity-100 transition-opacity duration-300"
            >
              <span
                className="absolute top-1/2 left-1/2 w-4 h-[1px] bg-[rgba(255,255,255,0.85)]"
                style={{
                  transform: 'translate(-50%, -50%) rotate(45deg)',
                }}
              />
              <span
                className="absolute top-1/2 left-1/2 w-4 h-[1px] bg-[rgba(255,255,255,0.85)]"
                style={{
                  transform: 'translate(-50%, -50%) rotate(-45deg)',
                }}
              />
            </button>

            <div className="text-center mb-10">
              <h2 className="text-[0.7rem] tracking-[0.4em] text-[rgba(255,255,255,0.4)] uppercase font-light">
                {t('application')}
              </h2>
            </div>

            {!showConfirmation ? (
              <form onSubmit={handleAccessRequest}>
                <div className="mb-6">
                  <Tooltip text={t('entityInfo')} ariaLabel={t('entityInfo')} />
                  <Input
                    ref={entityInputRef}
                    type="text"
                    placeholder={t('entity')}
                    required
                    value={entity}
                    onChange={(e) => setEntity(e.target.value)}
                    variant="dark"
                  />
                </div>
                <div className="mb-6">
                  <Tooltip text={t('contactInfo')} ariaLabel={t('contactInfo')} />
                  <Input
                    type="email"
                    placeholder={t('contact')}
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    variant="dark"
                  />
                </div>
                <div className="mb-6">
                  <Input
                    type="text"
                    label={t('position')}
                    placeholder={t('positionPlaceholder')}
                    variant="dark"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>
                <div className="mb-6">
                  <Tooltip text={t('referenceInfo')} ariaLabel={t('referenceInfo')} />
                  <Input
                    type="text"
                    placeholder={t('reference')}
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    variant="dark"
                  />
                </div>

                {error && (
                  <div className="mb-4 text-sm text-red-400" role="alert">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="mb-4 text-sm text-green-400" role="alert">
                    {successMessage}
                  </div>
                )}

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3.5 text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.6)] transition-colors duration-300 border border-[rgba(255,255,255,0.06)] bg-transparent text-[0.7rem] font-light tracking-[0.2em] uppercase cursor-pointer"
                  >
                    <span>{t('cancel')}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAccess}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-br from-[rgba(45,212,191,0.15)] to-[rgba(16,185,129,0.1)] border border-[rgba(45,212,191,0.3)] text-[rgba(255,255,255,0.85)] text-[0.7rem] font-light tracking-[0.2em] uppercase cursor-pointer transition-all duration-300 hover:from-[rgba(45,212,191,0.25)] hover:to-[rgba(16,185,129,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmittingAccess ? t('loading') : t('submit')}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="mb-6">
                  <p className="text-[0.85rem] text-[rgba(255,255,255,0.85)] mb-4">
                    {t('confirmData')}
                  </p>
                  
                  {confirmationData && (
                    <div className="space-y-4">
                      <div>
                        <p className="text-[0.7rem] tracking-[0.2em] uppercase text-[rgba(255,255,255,0.4)] mb-1">
                          {t('entity')}
                        </p>
                        <p className="text-[0.85rem] text-[rgba(255,255,255,0.85)] p-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded">
                          {confirmationData.entity}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.7rem] tracking-[0.2em] uppercase text-[rgba(255,255,255,0.4)] mb-1">
                          {t('contact')}
                        </p>
                        <p className="text-[0.85rem] text-[rgba(255,255,255,0.85)] p-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded">
                          {confirmationData.contact}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.7rem] tracking-[0.2em] uppercase text-[rgba(255,255,255,0.4)] mb-1">
                          {t('position')}
                        </p>
                        <p className="text-[0.85rem] text-[rgba(255,255,255,0.85)] p-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded">
                          {confirmationData.position}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.7rem] tracking-[0.2em] uppercase text-[rgba(255,255,255,0.4)] mb-1">
                          {t('reference')}
                        </p>
                        <p className="text-[0.85rem] text-[rgba(255,255,255,0.85)] p-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded">
                          {confirmationData.reference}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mb-4 text-sm text-red-400" role="alert">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="mb-4 text-sm text-green-400" role="alert">
                    {successMessage}
                  </div>
                )}

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="flex-1 px-4 py-3.5 text-[rgba(255,255,255,0.4)] hover:text-[rgba(255,255,255,0.6)] transition-colors duration-300 border border-[rgba(255,255,255,0.06)] bg-transparent text-[0.7rem] font-light tracking-[0.2em] uppercase cursor-pointer"
                  >
                    <span>{t('edit')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmationSubmit}
                    disabled={isSubmittingAccess}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-br from-[rgba(45,212,191,0.15)] to-[rgba(16,185,129,0.1)] border border-[rgba(45,212,191,0.3)] text-[rgba(255,255,255,0.85)] text-[0.7rem] font-light tracking-[0.2em] uppercase cursor-pointer transition-all duration-300 hover:from-[rgba(45,212,191,0.25)] hover:to-[rgba(16,185,129,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmittingAccess ? t('loading') : t('confirmSubmit')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInBrand {
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 480px) {
          .fixed.bottom-\\[8\\%\\].right-\\[6\\%\\] {
            bottom: 4%;
            right: 4%;
          }
          .fixed.bottom-\\[8\\%\\].right-\\[6\\%\\] h1 {
            font-size: 2rem;
          }
          .flex.flex-col.gap-4.w-\\[220px\\] {
            width: 180px;
          }
          .bg-\\[\\#12121a\\].border {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
