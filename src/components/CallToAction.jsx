import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import contactData from '../data/contact.json';

const CallToAction = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to a server
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        organization: '',
        message: '',
      });
    }, 3000);
  };

  return (
    <section id="unete" className="py-20 bg-light-bg-secondary dark:bg-dark-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
            {contactData.sectionTitle}
          </h2>
          <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary max-w-3xl mx-auto">
            {contactData.sectionSubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <motion.div
            id="contacto"
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-light-bg-primary dark:bg-dark-bg-primary p-8 rounded-xl shadow-lg border border-light-border-primary dark:border-dark-border-primary"
          >
            <h3 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-6">
              {contactData.form.title}
            </h3>

            {isSubmitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">✓</div>
                <p className="text-xl text-accent font-semibold">
                  {contactData.form.successMessage.title}
                </p>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">
                  {contactData.form.successMessage.subtitle}
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    {contactData.form.fields.name.label} {contactData.form.fields.name.required && '*'}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required={contactData.form.fields.name.required}
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    placeholder={contactData.form.fields.name.placeholder}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    {contactData.form.fields.email.label} {contactData.form.fields.email.required && '*'}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required={contactData.form.fields.email.required}
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    placeholder={contactData.form.fields.email.placeholder}
                  />
                </div>

                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    {contactData.form.fields.organization.label}
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                    placeholder={contactData.form.fields.organization.placeholder}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                    {contactData.form.fields.message.label} {contactData.form.fields.message.required && '*'}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required={contactData.form.fields.message.required}
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                    placeholder={contactData.form.fields.message.placeholder}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full px-8 py-4 bg-accent text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {contactData.form.submitButton}
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="bg-light-bg-primary dark:bg-dark-bg-primary p-8 rounded-xl shadow-lg border border-light-border-primary dark:border-dark-border-primary">
              <h3 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                {contactData.whyJoin.title}
              </h3>
              <ul className="space-y-4">
                {contactData.whyJoin.reasons.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-accent mr-3 text-xl">✓</span>
                    <span className="text-light-text-secondary dark:text-dark-text-secondary">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10 p-8 rounded-xl border border-accent/30">
              <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">
                {contactData.contactInfo.title}
              </h3>
              <div className="space-y-3 text-light-text-secondary dark:text-dark-text-secondary">
                <p>📧 Email: {contactData.contactInfo.email}</p>
                <p>📍 {contactData.contactInfo.location}</p>
                <p>🌐 {contactData.contactInfo.website}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;

