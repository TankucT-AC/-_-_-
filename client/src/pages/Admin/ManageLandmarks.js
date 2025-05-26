import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Fab
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

function ManageLandmarks() {
  const [landmarks, setLandmarks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    location: '',
    category_id: '',
  });
  const [newLandmarkData, setNewLandmarkData] = useState({
    name: '',
    description: '',
    location: '',
    category_id: '',
    img: null
  });
  const { user, token } = useAuth();

  useEffect(() => {
    fetchLandmarks();
    fetchCategories();
  }, []);

  const fetchLandmarks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ldmk/landmarks');
      setLandmarks(response.data);
    } catch (err) {
      setError('Ошибка при загрузке достопримечательностей');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ctgrs');
      setCategories(response.data);
    } catch (err) {
      setError('Ошибка при загрузке категорий');
    }
  };

  const handleEdit = (landmark) => {
    setSelectedLandmark(landmark);
    setEditFormData({
      name: landmark.name,
      description: landmark.description,
      location: landmark.location,
      category_id: landmark.category_id,
    });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/ldmk/landmarks/${selectedLandmark.id}`,
        editFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setSuccess('Достопримечательность успешно обновлена');
      setEditDialogOpen(false);
      fetchLandmarks();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при обновлении достопримечательности');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту достопримечательность?')) {
      try {
        await axios.delete(`http://localhost:5000/api/ldmk/landmarks/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setSuccess('Достопримечательность успешно удалена');
        fetchLandmarks();
      } catch (err) {
        setError(err.response?.data?.message || 'Ошибка при удалении достопримечательности');
      }
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddNew = () => {
    setNewLandmarkData({
      name: '',
      description: '',
      location: '',
      category_id: '',
      img: null
    });
    setAddDialogOpen(true);
  };

  const handleAddSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newLandmarkData.name);
      formData.append('description', newLandmarkData.description);
      formData.append('location', newLandmarkData.location);
      formData.append('category_id', newLandmarkData.category_id);
      formData.append('img', newLandmarkData.img);

      await axios.post('http://localhost:5000/api/ldmk/landmarks', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setSuccess('Достопримечательность успешно добавлена');
      setAddDialogOpen(false);
      fetchLandmarks();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при добавлении достопримечательности');
    }
  };

  const handleNewLandmarkChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'img') {
      setNewLandmarkData(prev => ({
        ...prev,
        img: files[0]
      }));
    } else {
      setNewLandmarkData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <Container>
        <Alert severity="error">
          Доступ запрещен. Только администратор может управлять достопримечательностями.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Управление достопримечательностями
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddNew}
            >
              Добавить новую
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Описание</TableCell>
                  <TableCell>Местоположение</TableCell>
                  <TableCell>Категория</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {landmarks.map((landmark) => (
                  <TableRow key={landmark.id}>
                    <TableCell>{landmark.name}</TableCell>
                    <TableCell>{landmark.description.substring(0, 100)}...</TableCell>
                    <TableCell>{landmark.location}</TableCell>
                    <TableCell>
                      {categories.find(c => c.id === landmark.category_id)?.name}
                    </TableCell>
                    <TableCell>
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(landmark)}
                        sx={{ mr: 1 }}
                      >
                        Изменить
                      </Button>
                      <Button
                        startIcon={<DeleteIcon />}
                        color="error"
                        onClick={() => handleDelete(landmark.id)}
                      >
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Редактировать достопримечательность</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название"
            name="name"
            value={editFormData.name}
            onChange={handleEditFormChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Описание"
            name="description"
            value={editFormData.description}
            onChange={handleEditFormChange}
            margin="normal"
            multiline
            rows={4}
            required
          />

          <TextField
            fullWidth
            label="Местоположение"
            name="location"
            value={editFormData.location}
            onChange={handleEditFormChange}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Категория</InputLabel>
            <Select
              name="category_id"
              value={editFormData.category_id}
              onChange={handleEditFormChange}
              label="Категория"
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Добавить новую достопримечательность</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название"
            name="name"
            value={newLandmarkData.name}
            onChange={handleNewLandmarkChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Описание"
            name="description"
            value={newLandmarkData.description}
            onChange={handleNewLandmarkChange}
            margin="normal"
            multiline
            rows={4}
            required
          />

          <TextField
            fullWidth
            label="Местоположение"
            name="location"
            value={newLandmarkData.location}
            onChange={handleNewLandmarkChange}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Категория</InputLabel>
            <Select
              name="category_id"
              value={newLandmarkData.category_id}
              onChange={handleNewLandmarkChange}
              label="Категория"
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="file"
            onChange={(e) => handleNewLandmarkChange({ target: { name: 'img', files: e.target.files } })}
            margin="normal"
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleAddSubmit} variant="contained" color="primary">
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ManageLandmarks; 