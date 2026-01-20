import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePartners } from '../contexts/PartnersContext';

const PartnersManagement = () => {
  const { getAllPartners, createPartner, updatePartner, deletePartner } = usePartners();
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const allPartners = getAllPartners();

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
    });
    setEditingPartner(null);
    setError('');
    setSuccess('');
  };

  const handleOpenModal = (partner = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name,
        logo_url: partner.logo_url || '',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(resetForm, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingPartner) {
        await updatePartner(editingPartner.id, formData);
        setSuccess('Aliado actualizado exitosamente');
      } else {
        await createPartner(formData);
        setSuccess('Aliado creado exitosamente');
      }
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al guardar el aliado');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este aliado?')) {
      try {
        await deletePartner(id);
      } catch (err) {
        setError(err.message || 'Error al eliminar el aliado');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
            Aliados Estratégicos
          </h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">
            Gestiona los logos de tus aliados estratégicos
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-secondary to-secondary-light text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          + Agregar Aliado
        </button>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {allPartners.map((partner) => (
            <motion.div
              key={partner.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl shadow-lg border border-light-border-primary dark:border-dark-border-primary overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Logo */}
              <div className="aspect-video bg-light-bg-secondary dark:bg-dark-bg-secondary flex items-center justify-center p-6">
                <img
                  src={partner.logo_url || '/imagenes/mascota/mascotaCentral.png'}
                  alt={partner.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    e.target.src = '/imagenes/mascota/mascotaCentral.png';
                  }}
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-3 text-center line-clamp-2">
                  {partner.name}
                </h3>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(partner)}
                    className="flex-1 bg-primary text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors duration-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(partner.id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors duration-300"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal for Create/Edit Partner */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-2xl shadow-2xl max-w-lg w-full"
            >
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    {editingPartner ? 'Editar Aliado' : 'Agregar Nuevo Aliado'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg mb-4">
                    {success}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                      Nombre del Aliado *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      maxLength={100}
                      className="w-full px-4 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300"
                      placeholder="Ej: Universidad de Chile"
                      required
                    />
                  </div>

                  {/* Logo URL */}
                  <div>
                    <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                      URL del Logo *
                    </label>
                    <input
                      type="url"
                      name="logo_url"
                      value={formData.logo_url}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300"
                      placeholder="https://ejemplo.com/logo.png"
                      required
                    />
                    <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                      URL de la imagen del logo (PNG, JPG, SVG)
                    </p>
                  </div>

                  {/* Preview */}
                  {formData.logo_url && (
                    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg p-4">
                      <p className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                        Vista Previa:
                      </p>
                      <div className="aspect-video bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center p-4">
                        <img
                          src={formData.logo_url}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.target.src = '/imagenes/mascota/mascotaCentral.png';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-6 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-primary dark:text-dark-text-primary rounded-lg font-semibold hover:bg-light-border-primary dark:hover:bg-dark-border-primary transition-colors duration-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-secondary to-secondary-light text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      {editingPartner ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnersManagement;

