import React, { useState } from 'react';
import {
  MapPin,
  PhoneCall,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Building2,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    inquiryType: 'Guest Reservation Inquiry',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-teal-700 bg-teal-100 uppercase tracking-widest px-3 py-1 rounded-full">
            Takoradi Support Desk
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3 tracking-tight">
            We’re Here to Help You Stay
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Have questions about booking a stay, listing your property, or student accommodation in Takoradi? Connect with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 1: Contact Details & Office */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                <span>Regional Support Office</span>
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Takoradi Office</strong>
                    <span>Harbour Commercial Corridor, Beach Road, Takoradi, Western Region, Ghana</span>
                    <span className="text-slate-400 block text-xs mt-0.5">(5 mins from TTU Campus &amp; Port)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PhoneCall className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Phone &amp; WhatsApp</strong>
                    <a href="tel:+233244123456" className="text-teal-700 hover:underline">
                      +233 (0) 244 123 456
                    </a>
                    <span className="text-slate-400 block text-xs mt-0.5">Direct agent hotline</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Official Support Email</strong>
                    <a href="mailto:support@findstay.com" className="text-teal-700 hover:underline">
                      support@findstay.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Working Hours</strong>
                    <span>Monday – Saturday: 8:00 AM – 8:00 PM GMT</span>
                    <span className="text-slate-400 block text-xs">Sunday: Emergency on-call support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Credential Note */}
            <div className="bg-gradient-to-br from-teal-900 to-slate-950 text-white p-6 rounded-3xl border border-teal-800 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-900/60 px-2 py-0.5 rounded inline-block mb-2">
                Takoradi Technical University
              </span>
              <h4 className="text-sm font-bold">Faculty of Applied Sciences &amp; Computing</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Department of Information Technology &bull; Advanced Java Programming Capstone Project &bull; Built in collaboration with Takoradi hospitality stakeholders.
              </p>
            </div>
          </div>

          {/* Right 2: Interactive Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl">
              {formSubmitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    Message Delivered!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{formData.name || 'Friend'}</strong>. Our Takoradi client desk has received your inquiry. We typically reply via WhatsApp or phone within two hours during business hours.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      Send Us a Direct Message
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Our customer service agents and student housing coordinators will respond promptly.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Kwame Mensah"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="024XXXXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                        Topic of Inquiry *
                      </label>
                      <select
                        value={formData.inquiryType}
                        onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                      >
                        <option>Guest Reservation Inquiry</option>
                        <option>TTU Student Hostel Booking</option>
                        <option>Property Owner Onboarding</option>
                        <option>Payment or Refund Assistance</option>
                        <option>Academic &amp; Media Inquiries</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Please let us know which property or dates you are inquiring about..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl p-3.5 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      We never share your details with third parties.
                    </span>
                    <button
                      type="submit"
                      className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-600/30 transition transform active:scale-95 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Inquiry</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
