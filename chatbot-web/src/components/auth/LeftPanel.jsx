import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Zap, FileText, Shield, CheckCircle2 } from 'lucide-react';

export default function LeftPanel() {
  const features = [
    { icon: <Zap size={20} className="icon-purple" />, text: "Instant AI Conversations" },
    { icon: <FileText size={20} className="icon-blue" />, text: "Document Intelligence" },
    { icon: <Bot size={20} className="icon-cyan" />, text: "Multi-Agent Workflows" },
    { icon: <Shield size={20} className="icon-green" />, text: "Secure & Private" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  // Generate random particles
  const particles = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }));

  return (
    <div className="left-panel">
      {/* Animated Background Layers */}
      <div className="aurora-bg"></div>
      <div className="headline-glow"></div>
      
      {/* Floating Orbs */}
      <div className="floating-orb orb-primary"></div>
      <div className="floating-orb orb-accent"></div>

      {/* Floating Particles (Layer 4) */}
      <div className="particles-container">
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="particle"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative-z left-panel-content flex-grow">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="logo-container"
          style={{ marginBottom: '2.5rem' }}
        >
          <div className="logo-icon-bg">
            <Bot size={24} color="white" />
          </div>
          <span className="logo-text">Nexus AI</span>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="hero-content"
          style={{ maxWidth: '30rem' }}
        >
          <motion.h1 variants={itemVariants} className="hero-title">
            Your Personal <br/>
            <span className="text-gradient">
              AI Workspace
            </span>
          </motion.h1>
          <motion.p variants={itemVariants} className="hero-subtitle" style={{ marginBottom: '2rem' }}>
            Chat, create, research and automate with one intelligent assistant. Designed for modern teams.
          </motion.p>

          <div className="features-list">
            {features.map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants} className="glass-card feature-item">
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <span className="feature-text">{feature.text}</span>
                <CheckCircle2 size={16} className="feature-check" />
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Centerpiece Visual: AI Core */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="ai-core-container"
      >
        <div className="ai-core-glow"></div>
        
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="ai-core-ring ai-core-ring-1"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="ai-core-ring ai-core-ring-2"
        />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="ai-core-ring ai-core-ring-3"
        />
        
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="ai-core-center"
        />
      </motion.div>

    </div>
  );
}
