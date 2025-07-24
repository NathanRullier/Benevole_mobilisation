import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
  Fab,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Add as AddIcon,
  FilterList,
  Clear,
  CalendarMonth,
  ViewList,
  ViewModule
} from "@mui/icons-material";
import { workshopService } from "../services/workshopService";
import type { WorkshopData, WorkshopFilters } from "../services/workshopService";
import WorkshopCard from "../components/WorkshopCard";
import WorkshopDetailModal from "../components/WorkshopDetailModal";
import WorkshopCreateModal from "../components/WorkshopCreateModal";
import WorkshopCalendar from "../components/WorkshopCalendar";
import { useAuth } from "../contexts/AuthContext";

const WorkshopsPage: React.FC = () => {
  const { user } = useAuth();
  const isCoordinator = user?.role === 'coordinator';
  const [workshops, setWorkshops] = useState<WorkshopData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WorkshopFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Available filter options
  const regions = [
    'Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil',
    'Sherbrooke', 'Saguenay', 'Trois-Rivières', 'Terrebonne', 'Saint-Jean-sur-Richelieu'
  ];

  const specializations = [
    'Employment Law', 'Corporate Law', 'Criminal Law', 'Family Law',
    'Immigration Law', 'Real Estate Law', 'Environmental Law', 'Tax Law',
    'Intellectual Property', 'Human Rights'
  ];

  const statuses = [
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'completed', label: 'Completed' }
  ];

  // Load workshops
  const loadWorkshops = async () => {
    try {
      setLoading(true);
      setError(null);

      const filterParams: WorkshopFilters = {
        region: selectedRegion || undefined,
        specialization: selectedSpecialization || undefined,
        status: selectedStatus || undefined,
        search: searchTerm || undefined,
        date: selectedDate || undefined,
        includeAllStatuses: isCoordinator
      };

      let response;
      if (isCoordinator) {
        response = await workshopService.getWorkshops(filterParams);
      } else {
        response = await workshopService.getAvailableWorkshops(filterParams);
      }

      setWorkshops(response.workshops);
    } catch (err) {
      console.error('Error loading workshops:', err);
      setError('Failed to load workshops. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load workshops on component mount and filter changes
  useEffect(() => {
    loadWorkshops();
  }, [selectedRegion, selectedSpecialization, selectedStatus, selectedDate, searchTerm, isCoordinator]);

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedSpecialization('');
    setSelectedStatus('');
    setSelectedDate('');
  };

  // Handle workshop selection
  const handleWorkshopSelect = (workshop: WorkshopData) => {
    setSelectedWorkshop(workshop);
    setModalOpen(true);
  };

  // Handle workshop application
  const handleWorkshopApply = (workshop: WorkshopData) => {
    // TODO: Implement application logic in MVP.5F
    console.log('Apply to workshop:', workshop.id);
    alert(`Application functionality will be implemented in MVP.5F\nWorkshop: ${workshop.title}`);
  };

  // Handle workshop edit (coordinator only)
  const handleWorkshopEdit = (workshop: WorkshopData) => {
    // TODO: Implement edit modal/form
    console.log('Edit workshop:', workshop.id);
    alert(`Workshop editing functionality will be implemented soon\nWorkshop: ${workshop.title}`);
  };

  // Handle workshop delete (coordinator only)
  const handleWorkshopDelete = async (workshop: WorkshopData) => {
    if (window.confirm(`Are you sure you want to delete "${workshop.title}"?`)) {
      try {
        await workshopService.deleteWorkshop(workshop.id!);
        loadWorkshops(); // Refresh the list
        setModalOpen(false);
        alert('Workshop deleted successfully');
      } catch (err) {
        console.error('Error deleting workshop:', err);
        alert('Failed to delete workshop. Please try again.');
      }
    }
  };

  // Handle workshop creation (coordinator only)
  const handleCreateWorkshop = () => {
    setCreateModalOpen(true);
  };

  // Handle successful workshop creation
  const handleWorkshopCreated = () => {
    loadWorkshops(); // Refresh the workshop list
  };

  // Get active filters count
  const activeFiltersCount = [
    selectedRegion,
    selectedSpecialization,
    selectedStatus,
    selectedDate,
    searchTerm
  ].filter(Boolean).length;

  return (
    <Container data-testid="workshop-list" maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {isCoordinator ? 'Workshop Management' : 'Available Workshops'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* View mode toggle */}
          <Tooltip title="List View">
            <IconButton
              onClick={() => setViewMode('list')}
              color={viewMode === 'list' ? 'primary' : 'default'}
            >
              <ViewList />
            </IconButton>
          </Tooltip>
          <Tooltip title="Grid View">
            <IconButton
              onClick={() => setViewMode('grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
            >
              <ViewModule />
            </IconButton>
          </Tooltip>
          <Tooltip title="Calendar View">
            <IconButton
              onClick={() => setViewMode('calendar')}
              color={viewMode === 'calendar' ? 'primary' : 'default'}
            >
              <CalendarMonth />
            </IconButton>
          </Tooltip>

          {/* Create workshop button (coordinator only) */}
          {isCoordinator && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateWorkshop}
              sx={{ ml: 2 }}
            >
              Create Workshop
            </Button>
          )}
        </Box>
      </Box>

      {/* Filters */}
      <Box data-testid="workshop-filters" sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          {/* Search */}
          <TextField
            data-testid="search-workshops"
            placeholder="Search workshops..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ minWidth: 200 }}
          />

          {/* Region filter */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Region</InputLabel>
            <Select
              data-testid="filter-region"
              label="Region"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <MenuItem value="">All Regions</MenuItem>
              {regions.map((region) => (
                <MenuItem key={region} value={region}>{region}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Specialization filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Specialization</InputLabel>
            <Select
              data-testid="filter-specialization"
              label="Specialization"
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
            >
              <MenuItem value="">All Specializations</MenuItem>
              {specializations.map((spec) => (
                <MenuItem key={spec} value={spec}>{spec}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status filter (coordinator only) */}
          {isCoordinator && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                data-testid="filter-status"
                label="Status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {statuses.map((status) => (
                  <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Date filter */}
          <TextField
            type="date"
            data-testid="filter-date"
            variant="outlined"
            size="small"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            label="Date"
            sx={{ minWidth: 140 }}
          />

          {/* Clear filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={clearFilters}
              size="small"
            >
              Clear ({activeFiltersCount})
            </Button>
          )}
        </Box>

        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {searchTerm && (
              <Chip
                label={`Search: ${searchTerm}`}
                size="small"
                onDelete={() => setSearchTerm('')}
                variant="outlined"
              />
            )}
            {selectedRegion && (
              <Chip
                label={`Region: ${selectedRegion}`}
                size="small"
                onDelete={() => setSelectedRegion('')}
                variant="outlined"
              />
            )}
            {selectedSpecialization && (
              <Chip
                label={`Specialization: ${selectedSpecialization}`}
                size="small"
                onDelete={() => setSelectedSpecialization('')}
                variant="outlined"
              />
            )}
            {selectedStatus && (
              <Chip
                label={`Status: ${selectedStatus}`}
                size="small"
                onDelete={() => setSelectedStatus('')}
                variant="outlined"
              />
            )}
            {selectedDate && (
              <Chip
                label={`Date: ${selectedDate}`}
                size="small"
                onDelete={() => setSelectedDate('')}
                variant="outlined"
              />
            )}
          </Stack>
        )}
      </Box>

      {/* Results summary */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1" color="text.secondary">
          {loading ? 'Loading...' : `${workshops.length} workshop${workshops.length !== 1 ? 's' : ''} found`}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList fontSize="small" />
          <Typography variant="body2" color="text.secondary">
            {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
          </Typography>
        </Box>
      </Box>

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Workshops list */}
      {!loading && !error && (
        <>
          {viewMode === 'calendar' ? (
            <WorkshopCalendar
              workshops={workshops}
              onWorkshopSelect={handleWorkshopSelect}
              viewMode={isCoordinator ? 'coordinator' : 'volunteer'}
            />
          ) : workshops.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No workshops found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeFiltersCount > 0 
                  ? 'Try adjusting your filters to see more results'
                  : 'There are no workshops available at the moment'
                }
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {workshops.map((workshop) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={viewMode === 'grid' ? 6 : 12} 
                  md={viewMode === 'grid' ? 4 : 12}
                  key={workshop.id}
                >
                  <WorkshopCard
                    workshop={workshop}
                    onSelect={handleWorkshopSelect}
                    onApply={handleWorkshopApply}
                    onEdit={handleWorkshopEdit}
                    onDelete={handleWorkshopDelete}
                    viewMode={isCoordinator ? 'coordinator' : 'volunteer'}
                    showActions={true}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Workshop detail modal */}
      <WorkshopDetailModal
        workshop={selectedWorkshop}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onApply={handleWorkshopApply}
        onEdit={handleWorkshopEdit}
        onDelete={handleWorkshopDelete}
        viewMode={isCoordinator ? 'coordinator' : 'volunteer'}
      />

      {/* Workshop creation modal (coordinator only) */}
      {isCoordinator && (
        <WorkshopCreateModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={handleWorkshopCreated}
        />
      )}

      {/* Floating action button (coordinator only) */}
      {isCoordinator && (
        <Fab
          color="primary"
          aria-label="add workshop"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleCreateWorkshop}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default WorkshopsPage; 