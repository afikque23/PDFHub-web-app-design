import React from "react";
import { Zap, ShieldCheck, ThumbsUp, RefreshCw, Github, Linkedin, Globe, Mail } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";

export default function About() {
  const stats = [
    { label: "PDF Tools Available", value: "24+" },
    { label: "Files Processed", value: "1.2M+" },
    { label: "Active Users", value: "50k+" },
    { label: "Average Processing Time", value: "< 2s" }
  ];

  const coreValues = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Processing",
      description: "Optimized tools for quick document processing."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Privacy First",
      description: "Uploaded files are encrypted and automatically deleted after processing."
    },
    {
      icon: <ThumbsUp className="w-6 h-6" />,
      title: "Easy to Use",
      description: "Clean and intuitive interface for users of all experience levels."
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Always Improving",
      description: "Continuous updates based on user feedback and new technologies."
    }
  ];

  const contacts = [
    { icon: <Mail className="w-6 h-6" />, label: "Email", href: "#" },
    { icon: <Github className="w-6 h-6" />, label: "GitHub", href: "#" },
    { icon: <Linkedin className="w-6 h-6" />, label: "LinkedIn", href: "#" },
    { icon: <Globe className="w-6 h-6" />, label: "Portfolio Website", href: "#" }
  ];

  return (
    <div className="py-20 px-6 max-w-5xl mx-auto flex flex-col items-center">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-24">
        <h1 className="text-4xl md:text-[48px] font-bold text-text-primary mb-6 tracking-tight">About PDFHub</h1>
        <p className="text-xl md:text-[22px] font-medium text-text-primary mb-8 leading-snug">
          Built to make working with PDF files faster, simpler, and more accessible for everyone.
        </p>
        <p className="text-[16px] md:text-[18px] text-text-secondary leading-relaxed text-left md:text-center">
          PDFHub is an independent project created and developed by Arya Yusufa Agnil Fikri. The goal of PDFHub is to provide a simple, fast, secure, and user-friendly platform for managing PDF documents online. Whether you need to merge, split, compress, convert, or optimize PDF files, PDFHub aims to make the process effortless without requiring software installation.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        <div className="bg-white p-8 border border-border rounded-2xl shadow-sm flex flex-col">
          <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center mb-6">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-4">Mission</h3>
          <p className="text-text-secondary leading-relaxed">
            To provide a reliable and accessible PDF toolkit that helps students, professionals, businesses, and everyday users complete document-related tasks quickly and efficiently.
          </p>
        </div>
        <div className="bg-white p-8 border border-border rounded-2xl shadow-sm flex flex-col">
          <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center mb-6">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-4">Vision</h3>
          <p className="text-text-secondary leading-relaxed">
            To become one of the most trusted online PDF utility platforms by continuously improving performance, security, and user experience.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="w-full mb-24">
        <h2 className="text-3xl font-bold text-text-primary text-center mb-12">Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValues.map((value, i) => (
            <div key={i} className="bg-white p-6 border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center mb-5">
                {value.icon}
              </div>
              <h4 className="text-[18px] font-bold text-text-primary mb-3">{value.title}</h4>
              <p className="text-sm text-text-secondary leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Developer Profile */}
      <div className="w-full mb-24">
        <h2 className="text-3xl font-bold text-text-primary text-center mb-12">Meet the Developer</h2>
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
          <div className="md:w-1/3 bg-bg-base relative min-h-[300px]">
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1543132220-3ec99c6094dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkZXZlbG9wZXIlMjBwb3J0cmFpdCUyMG1hbGUlMjBpbmRvbmVzaWFuJTIwYXNpYW58ZW58MXx8fHwxNzgyNDYzNjI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Arya Yusufa Agnil Fikri"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="md:w-2/3 p-8 md:p-10 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-text-primary mb-2">Arya Yusufa Agnil Fikri</h3>
            <p className="text-primary font-medium mb-6">Full-stack Web Developer</p>
            <p className="text-text-secondary leading-relaxed mb-8">
              Full-stack web developer passionate about building practical digital solutions and productivity tools. PDFHub is designed with a focus on simplicity, performance, and user experience, helping people work with documents more efficiently.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="gap-2">
                <Github className="w-4 h-4" /> GitHub
              </Button>
              <Button variant="outline" className="gap-2">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </Button>
              <Button variant="outline" className="gap-2">
                <Globe className="w-4 h-4" /> Portfolio
              </Button>
              <Button variant="primary" className="gap-2">
                <Mail className="w-4 h-4" /> Contact
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="w-full mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="text-center p-8 bg-white border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-3">{stat.value}</div>
              <div className="text-[13px] text-text-secondary font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="w-full">
        <h2 className="text-3xl font-bold text-text-primary text-center mb-12">Let's Connect</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {contacts.map((contact, i) => (
            <a 
              key={i} 
              href={contact.href}
              className="flex flex-col items-center justify-center p-8 bg-white border border-border rounded-2xl shadow-sm hover:shadow-md hover:border-primary-light transition-all group cursor-pointer text-center"
            >
              <div className="w-14 h-14 bg-bg-base group-hover:bg-primary group-hover:text-white rounded-full flex items-center justify-center mb-4 transition-colors text-text-secondary">
                {contact.icon}
              </div>
              <span className="font-semibold text-text-primary">{contact.label}</span>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
