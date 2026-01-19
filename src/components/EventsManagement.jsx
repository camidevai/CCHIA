import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEvents } from '../contexts/EventsContext';

const EventsManagement = () => {
  const { getAllEvents, createEvent, updateEvent, deleteEvent, formatEventDate } = useEvents();
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    photo: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const allEvents = getAllEvents();

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      description: '',
      photo: '',
    });
    setEditingEvent(null);
    setError('');
    setSuccess('');
  };

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        date: event.date,
        description: event.description,
        photo: event.photo || '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!formData.title || formData.title.length > 100) {
      setError('El título es requerido y debe tener máximo 100 caracteres');
      return;
    }

    if (!formData.date) {
      setError('La fecha es requerida');
      return;
    }

    if (!formData.description || formData.description.length > 500) {
      setError('La descripción es requerida y debe tener máximo 500 caracteres');
      return;
    }

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, formData);
        setSuccess('Evento actualizado exitosamente en el JSON');
      } else {
        await createEvent(formData);
        setSuccess('Evento creado exitosamente en el JSON');
      }

      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err) {
      setError('Error al guardar el evento. Asegúrate de que el servidor esté corriendo.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      try {
        await deleteEvent(id);
        setSuccess('Evento eliminado exitosamente del JSON');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Error al eliminar el evento. Asegúrate de que el servidor esté corriendo.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
          Gestión de Eventos
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="bg-gradient-to-r from-secondary to-secondary-light text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          + Crear Evento
        </motion.button>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allEvents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-light-text-secondary dark:text-dark-text-secondary">
            <p className="text-lg">No hay eventos creados aún</p>
            <p className="text-sm mt-2">Haz clic en "Crear Evento" para agregar uno</p>
          </div>
        ) : (
          allEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl overflow-hidden shadow-lg border border-light-border-primary dark:border-dark-border-primary"
            >
              {/* Event Image */}
              <div className="h-40 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                {event.photo ? (
                  <img
                    src={event.photo}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-light-text-tertiary dark:text-dark-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Event Content */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-2 line-clamp-1">
                  {event.title}
                </h3>
                <p className="text-sm text-secondary dark:text-secondary-light mb-2">
                  {formatEventDate(event.date)}
                </p>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-2 mb-4">
                  {event.description}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(event)}
                    className="flex-1 bg-primary text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors duration-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors duration-300"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal for Create/Edit Event */}
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
              className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    {editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
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
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                      Título del Evento *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      maxLength={100}
                      className="w-full px-4 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300"
                      placeholder="Ej: Conferencia de IA 2024"
                      required
                    />
                    <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                      {formData.title.length}/100 caracteres
                    </p>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                      Fecha y Hora *
                    </label>
                    <input
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300"
                      required
                    />
                  </div>

                  {/* Photo URL */}
                  <div>
                    <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                      URL de la Imagen
                    </label>
                    <input
                      type="url"
                      name="photo"
                      value={formData.photo}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                      Opcional: URL de la imagen del evento
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                      Descripción *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      maxLength={500}
                      rows={5}
                      className="w-full px-4 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-secondary transition-all duration-300 resize-none"
                      placeholder="Describe el evento..."
                      required
                    />
                    <p className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                      {formData.description.length}/500 caracteres
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-6 py-3 bg-light-bg-secondary dark:bg-dark-bg-secondary text-light-text-primary dark:text-dark-text-primary rounded-lg font-semibold hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary transition-all duration-300"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-secondary to-secondary-light text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {editingEvent ? 'Actualizar' : 'Crear'} Evento
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

export default EventsManagement;

