import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  CardActionArea,
  CircularProgress,
  Box,
  Chip,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Rating
} from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ReviewForm from '../components/ReviewForm';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Landmarks() {
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLandmark, setSelectedLandmark] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [landmarkRatings, setLandmarkRatings] = useState({});
  const query = useQuery();
  const searchQuery = query.get('search');
  const categoryId = query.get('category');

  const fetchLandmarkRatings = async () => {
    try {
      const ratingPromises = landmarks.map(landmark => 
        axios.get(`http://localhost:5000/api/reviews/landmark/${landmark.id}`)
      );
      const ratingResponses = await Promise.all(ratingPromises);
      
      const ratings = {};
      ratingResponses.forEach((response, index) => {
        const reviews = response.data;
        if (reviews.length > 0) {
          const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
          ratings[landmarks[index].id] = {
            average: averageRating,
            count: reviews.length
          };
        }
      });
      setLandmarkRatings(ratings);
    } catch (err) {
      console.error('Ошибка при загрузке рейтингов:', err);
    }
  };

  useEffect(() => {
    const fetchLandmarks = async () => {
      try {
        let url = 'http://localhost:5000/api/ldmk/landmarks';
        const params = new URLSearchParams();
        
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        if (categoryId) {
          params.append('categoryId', categoryId);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await axios.get(url);
        setLandmarks(response.data);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке достопримечательностей');
        setLoading(false);
      }
    };

    fetchLandmarks();
  }, [searchQuery, categoryId]);

  useEffect(() => {
    if (landmarks.length > 0) {
      fetchLandmarkRatings();
    }
  }, [landmarks]);

  const handleReviewClick = (e, landmark) => {
    e.preventDefault();
    setSelectedLandmark(landmark);
    setReviewModalOpen(true);
  };

  const handleReviewAdded = (newReview) => {
    setReviewModalOpen(false);
    fetchLandmarkRatings(); // Обновляем рейтинги после добавления отзыва
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center" variant="h6">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Достопримечательности Дагестана
        {searchQuery && (
          <Typography variant="h6" color="textSecondary" sx={{ mt: 1 }}>
            Результаты поиска: "{searchQuery}"
          </Typography>
        )}
      </Typography>
      
      <Grid container spacing={4}>
        {landmarks.map((landmark) => (
          <Grid item xs={12} sm={6} md={4} key={landmark.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardActionArea 
                component={Link} 
                to={`/landmarks/${landmark.id}`}
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
              >
                <Box sx={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
                  <CardMedia
                    component="img"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    image={`http://localhost:5000/${landmark.img}`}
                    alt={landmark.name}
                  />
                </Box>
                <CardContent>
                  <Typography gutterBottom variant="h6" component="h2">
                    {landmark.name}
                  </Typography>
                  {landmark.Category && (
                    <Chip 
                      label={landmark.Category.name} 
                      size="small" 
                      color="primary" 
                      sx={{ alignSelf: 'flex-start', mb: 1 }}
                    />
                  )}
                  {landmarkRatings[landmark.id] && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Rating 
                        value={landmarkRatings[landmark.id].average} 
                        precision={0.1} 
                        readOnly 
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary">
                        ({landmarkRatings[landmark.id].count})
                      </Typography>
                    </Box>
                  )}
                  <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    component="p"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {landmark.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  onClick={(e) => handleReviewClick(e, landmark)}
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<RateReviewIcon />}
                >
                  Добавить отзыв
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog 
        open={reviewModalOpen} 
        onClose={() => setReviewModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Добавить отзыв: {selectedLandmark?.name}
        </DialogTitle>
        <DialogContent>
          {selectedLandmark && (
            <ReviewForm 
              landmarkId={selectedLandmark.id}
              onReviewAdded={handleReviewAdded}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default Landmarks; 