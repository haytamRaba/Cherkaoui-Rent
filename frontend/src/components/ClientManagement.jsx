import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Users, Phone } from 'lucide-react';
import { clientsAPI } from '../services/api';
import DocumentUploader from './DocumentUploader'; // Assurez-vous que ce composant existe

const ClientManagement = () => {
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0, limit: 10 });

  const [showForm, setShowForm] = useState(false);
  const [editClientId, setEditClientId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormData = {
    firstName: '', lastName: '', phone: '', dateOfBirth: '',
    nationalId: '', licenseNumber: '', licenseExpiryDate: '',
    status: 'active', blacklistReason: '', notes: ''
  };
  const [formData, setFormData] = useState(initialFormData);

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    blacklisted: 'bg-red-100 text-red-800',
    suspended: 'bg-yellow-100 text-yellow-800'
  };

  const fetchClients = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: pagination.limit, search: searchTerm, status: statusFilter };
      const response = await clientsAPI.getAll(params);
      setClients(response.data.clients);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching clients:', error);
      // Gérer l'erreur d'affichage (ex: toast)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => fetchClients(1), 300); // Debounce search
    return () => clearTimeout(handler);
  }, [searchTerm, statusFilter]);

  const handlePageChange = (page) => {
    if (page > 0 && page <= pagination.pages) {
      fetchClients(page);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditClientId(null);
    setShowForm(false);
    setIsSubmitting(false);
  };

  const validateFormData = (data) => {
    if (!data.firstName.trim() || !data.lastName.trim() || !data.phone.trim() || !data.dateOfBirth || !data.nationalId.trim() || !data.licenseNumber.trim() || !data.licenseExpiryDate) {
      alert('Veuillez remplir tous les champs obligatoires (*).');
      return false;
    }
    if (new Date(data.licenseExpiryDate) < new Date()) {
      alert("La date d'expiration du permis ne peut pas être dans le passé.");
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateFormData(formData)) return;

    setIsSubmitting(true);
    try {
      const apiCall = editClientId 
        ? clientsAPI.update(editClientId, formData) 
        : clientsAPI.create(formData);
      
      const response = await apiCall;

      alert(`Client ${editClientId ? 'modifié' : 'ajouté'} avec succès !`);
      resetForm();
      fetchClients(editClientId ? pagination.current : 1); // Rafraîchir la liste
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      const errorMessage = error.response?.data?.message || `Erreur lors de ${editClientId ? 'la modification' : 'l\'ajout'} du client.`;
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClient = (client) => {
    setFormData({
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      phone: client.phone || '',
      dateOfBirth: client.dateOfBirth ? client.dateOfBirth.slice(0, 10) : '',
      nationalId: client.nationalId || '',
      licenseNumber: client.licenseNumber || '',
      licenseExpiryDate: client.licenseExpiryDate ? client.licenseExpiryDate.slice(0, 10) : '',
      status: client.status || 'active',
      blacklistReason: client.blacklistReason || '',
      notes: client.notes || ''
    });
    setEditClientId(client._id);
    setShowForm(true);
    window.scrollTo(0, 0); // Scroll to top to see the form
  };

  const handleAddNewClient = () => {
    resetForm();
    setShowForm(true);
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    return age > 0 ? age : 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">{t('clientManagement')}</h2>
        <Button onClick={handleAddNewClient}><Plus className="h-4 w-4 mr-2" />{t('addClient')}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>{editClientId ? 'Modifier le client' : 'Ajouter un nouveau client'}</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="firstName" placeholder="Prénom *" value={formData.firstName} onChange={handleFormChange} required disabled={isSubmitting} />
                <Input name="lastName" placeholder="Nom *" value={formData.lastName} onChange={handleFormChange} required disabled={isSubmitting} />
                <Input name="nationalId" placeholder="CIN *" value={formData.nationalId} onChange={handleFormChange} required disabled={isSubmitting} />
                <Input name="phone" placeholder="Téléphone *" value={formData.phone} onChange={handleFormChange} required disabled={isSubmitting} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance *</label>
                  <Input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleFormChange} required disabled={isSubmitting} max={new Date().toISOString().split('T')[0]} />
                </div>
                <Input name="licenseNumber" placeholder="Numéro de permis *" value={formData.licenseNumber} onChange={handleFormChange} required disabled={isSubmitting} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration du permis *</label>
                <Input name="licenseExpiryDate" type="date" value={formData.licenseExpiryDate} onChange={handleFormChange} required disabled={isSubmitting} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select name="status" value={formData.status} onChange={handleFormChange} className="w-full border rounded px-3 py-2 bg-white" disabled={isSubmitting}>
                  <option value="active">Actif</option>
                  <option value="blacklisted">Black-listé</option>
                  <option value="suspended">Suspendu</option>
                </select>
              </div>
              {formData.status === 'blacklisted' && <Input name="blacklistReason" placeholder="Raison du blacklist" value={formData.blacklistReason} onChange={handleFormChange} disabled={isSubmitting} />}
              <textarea name="notes" placeholder="Notes additionnelles" value={formData.notes} onChange={handleFormChange} className="w-full border rounded px-3 py-2 min-h-[80px]" disabled={isSubmitting} />
              
              {editClientId && (
                <div className="space-y-2 border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-2">Documents du client</h3>
                  <DocumentUploader clientId={editClientId} type="nationalId" label="CIN" />
                  <DocumentUploader clientId={editClientId} type="license" label="Permis de conduire" />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'En cours...' : (editClientId ? 'Modifier' : 'Ajouter')}</Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('search')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              {['active', 'blacklisted', 'suspended'].map((status) => (
                <Button key={status} variant={statusFilter === status ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(statusFilter === status ? '' : status)}>{t(status)}</Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">Chargement des clients...</div>
      ) : clients.length > 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <Card key={client._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{client.firstName} {client.lastName}</CardTitle>
                    <Badge className={statusColors[client.status]}>{t(client.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{client.phone}</span></div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Âge:</span><div className="font-medium">{calculateAge(client.dateOfBirth)} ans</div></div>
                    <div><span className="text-muted-foreground">Permis:</span><div className="font-medium">{client.licenseNumber}</div></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditClient(client)}><Edit className="h-4 w-4 mr-1" />{t('edit')}</Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={async () => { if (window.confirm('Confirmer la suppression ?')) { await clientsAPI.delete(client._id); fetchClients(pagination.current); } }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="outline" disabled={pagination.current === 1} onClick={() => handlePageChange(pagination.current - 1)}>Précédent</Button>
            <span className="self-center text-sm">Page {pagination.current} sur {pagination.pages}</span>
            <Button variant="outline" disabled={pagination.current === pagination.pages} onClick={() => handlePageChange(pagination.current + 1)}>Suivant</Button>
          </div>
        </>
      ) : (
        <Card><CardContent className="text-center py-8"><Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-medium">Aucun client trouvé</h3></CardContent></Card>
      )}
    </div>
  );
};

export default ClientManagement;
