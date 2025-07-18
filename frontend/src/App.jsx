import React, { useState, useEffect } from "react";
import {
  Box, Container, TextField, Button, Typography, CircularProgress,
  Card, CardContent, Chip, Link, List, ListItem, Divider, Grid,
  Tabs, Tab, Paper, Alert, Accordion, AccordionSummary, AccordionDetails,
  Skeleton, LinearProgress, Backdrop, IconButton, Tooltip, Fade
} from "@mui/material";
import {
  Storefront as StorefrontIcon,
  ExpandMore as ExpandMoreIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon
} from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import axios from "axios";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00d4ff" },
    secondary: { main: "#ff6b6b" },
    background: { 
      default: "transparent", 
      paper: "rgba(17,24,39,0.85)" 
    },
    success: { main: "#4ade80" },
    warning: { main: "#fbbf24" },
    info: { main: "#3b82f6" }
  },
  components: {
    MuiPaper: { 
      styleOverrides: { 
        root: { 
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)"
        } 
      } 
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "rgba(17,24,39,0.7)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.05)"
        }
      }
    }
  }
});

function TabPanel({ children, value, index }) {
  return value === index && <Box sx={{ p: 3 }}>{children}</Box>;
}

// Professional loading skeleton
const LoadingSkeleton = () => (
  <Card sx={{ mt: 2 }}>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="text" width="40%" height={32} />
      </Box>
      <Skeleton variant="rectangular" width="100%" height={4} sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        {[...Array(6)].map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Skeleton variant="rectangular" width="100%" height={120} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </Grid>
        ))}
      </Grid>
    </CardContent>
  </Card>
);

// Professional stats component
const StatsCard = ({ icon, title, value, color }) => (
  <Card sx={{ 
    background: `linear-gradient(135deg, ${color}20, ${color}10)`,
    border: `1px solid ${color}30`,
    transition: "all 0.3s ease",
    "&:hover": { transform: "translateY(-4px)", boxShadow: 6 }
  }}>
    <CardContent sx={{ textAlign: "center", py: 2 }}>
      <Box sx={{ color: color, mb: 1 }}>{icon}</Box>
      <Typography variant="h4" sx={{ fontWeight: "bold", color: color }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

export default function App() {
  const [url, setUrl] = useState("");
  const [insights, setInsights] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [competitorLoading, setCompetitorLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [progress, setProgress] = useState(0);

  // Simulate progress for better UX
  useEffect(() => {
    let interval;
    if (loading || competitorLoading) {
      interval = setInterval(() => {
        setProgress(prev => prev >= 90 ? 90 : prev + 10);
      }, 500);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading, competitorLoading]);

  const fetchInsights = async () => {
    if (!url) return alert("Please enter a Shopify store URL");
    setLoading(true);
    setInsights(null);
    setProgress(0);
    
    try {
      const res = await axios.post(
        `http://localhost:8000/fetch-shopify-insights?website_url=${encodeURIComponent(url)}`
      );
      setInsights(res.data);
      setProgress(100);
    } catch (e) {
      alert(e?.response?.data?.detail || e.message);
    }
    setLoading(false);
  };

  const fetchCompetitors = async () => {
    if (!url) return alert("Please enter a URL first");
    setCompetitorLoading(true);
    setCompetitors([]);
    setProgress(0);
    
    try {
      const res = await axios.post(
        `http://localhost:8000/competitors?website_url=${encodeURIComponent(url)}`
      );
      setCompetitors(res.data.competitors || []);
      setTabValue(1);
      setProgress(100);
    } catch (e) {
      alert(e?.response?.data?.detail || e.message);
    }
    setCompetitorLoading(false);
  };

  const HeroGrid = ({ list, title = "Hero Products" }) => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <TrendingUpIcon color="primary" />
        {title}
      </Typography>
      <Grid container spacing={2}>
        {list.slice(0, 8).map((p, i) => (
          <Grid item key={i} xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: "100%", 
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": { 
                transform: "translateY(-8px) scale(1.02)",
                boxShadow: "0 20px 40px rgba(0,212,255,0.15)"
              }
            }}>
              {p.image && (
                <Box
                  component="img"
                  src={p.image}
                  alt={p.title}
                  sx={{ 
                    width: "100%", 
                    height: 140, 
                    objectFit: "cover",
                    transition: "transform 0.3s ease",
                    "&:hover": { transform: "scale(1.05)" }
                  }}
                />
              )}
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body2" noWrap title={p.title} sx={{ mb: 1 }}>
                  {p.title}
                </Typography>
                {p.price && (
                  <Chip 
                    label={`₹${p.price}`} 
                    size="small" 
                    color="success"
                    sx={{ fontWeight: "bold" }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const InsightCard = (d, title = null) => (
    <Fade in timeout={800}>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <StorefrontIcon color="primary" fontSize="large" />
            <Box>
              <Typography variant="h5" color="primary" sx={{ fontWeight: "bold" }}>
                {title || d.store_url}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete brand analysis report
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <StatsCard 
                icon={<AnalyticsIcon fontSize="large" />}
                title="Products"
                value={d.products.length}
                color="#4ade80"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatsCard 
                icon={<TrendingUpIcon fontSize="large" />}
                title="Hero Items"
                value={d.hero_products.length}
                color="#fbbf24"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatsCard 
                icon={<SpeedIcon fontSize="large" />}
                title="FAQs"
                value={d.faqs.length}
                color="#3b82f6"
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <StatsCard 
                icon={<VisibilityIcon fontSize="large" />}
                title="Socials"
                value={Object.keys(d.social_handles).length}
                color="#ff6b6b"
              />
            </Grid>
          </Grid>

          {/* Detailed Information */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>Store Information</Typography>
                {["about", "privacy_policy", "return_policy"].map((k) => (
                  <Box key={k} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                      {k.replace("_", " ").toUpperCase()}:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {d[k] ? d[k].substring(0, 120) + "..." : "Not available"}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: "100%" }}>
                <Typography variant="h6" gutterBottom>Contact Information</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                    Email Addresses:
                  </Typography>
                  {d.contacts.emails.length > 0 ? (
                    d.contacts.emails.map(email => (
                      <Chip key={email} label={email} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No emails found</Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                    Phone Numbers:
                  </Typography>
                  {d.contacts.phones.length > 0 ? (
                    d.contacts.phones.map(phone => (
                      <Chip key={phone} label={phone} size="small" sx={{ mr: 1, mb: 1 }} />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No phones found</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Hero Products */}
          {d.hero_products.length > 0 && <HeroGrid list={d.hero_products} />}

          {/* All Products Accordion */}
          {d.products.length > 0 && (
            <Accordion sx={{ mt: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  All Products ({d.products.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ maxHeight: 300, overflowY: "auto" }}>
                <List dense>
                  {d.products.slice(0, 50).map((p, idx) => (
                    <ListItem key={idx} sx={{ 
                      border: "1px solid rgba(255,255,255,0.1)", 
                      borderRadius: 1, 
                      mb: 1,
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" }
                    }}>
                      <Link href={p.url} target="_blank" rel="noopener" sx={{ flexGrow: 1 }}>
                        {p.title}
                      </Link>
                      {p.price && (
                        <Chip label={`₹${p.price}`} size="small" color="success" />
                      )}
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Social Handles */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Social Media Presence</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {Object.entries(d.social_handles).map(([platform, url]) => (
                <Tooltip key={platform} title={`Visit ${platform}`}>
                  <Chip
                    label={platform}
                    color="primary"
                    variant="outlined"
                    component="a"
                    href={url}
                    target="_blank"
                    rel="noopener"
                    clickable
                    sx={{ 
                      transition: "all 0.2s ease",
                      "&:hover": { 
                        backgroundColor: "primary.main", 
                        color: "white",
                        transform: "scale(1.05)"
                      }
                    }}
                  />
                </Tooltip>
              ))}
              {Object.keys(d.social_handles).length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No social media links found
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Fade>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      
      {/* Professional Loading Overlay */}
      <Backdrop
        sx={{ 
          color: "#fff", 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0,0,0,0.8)"
        }}
        open={loading || competitorLoading}
      >
        <Box sx={{ textAlign: "center", width: "100%", maxWidth: 400 }}>
          <CircularProgress color="primary" size={80} thickness={4} />
          <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
            {loading ? "🔍 Analyzing Store..." : "🏪 Finding Competitors..."}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {loading ? "Extracting products, policies, and insights" : "Discovering similar stores in your market"}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              width: "100%", 
              height: 8, 
              borderRadius: 4,
              backgroundColor: "rgba(255,255,255,0.1)"
            }} 
          />
          <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
            {progress}% Complete
          </Typography>
        </Box>
      </Backdrop>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Professional Header */}
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h2"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              fontWeight: "bold",
              background: "linear-gradient(45deg, #00d4ff, #ff6b6b)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              mb: 2,
              transition: "all 0.3s ease",
              "&:hover": { transform: "scale(1.02)" }
            }}
          >
            <StorefrontIcon fontSize="inherit" sx={{ color: "#00d4ff" }} />
            Shopify Insights Pro
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
            Professional E-commerce Intelligence Platform
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Advanced brand analysis • Competitor discovery • Market insights
          </Typography>
        </Box>

        {/* Professional Input Section */}
        <Paper elevation={6} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Enter Store URL for Analysis
          </Typography>
          <TextField
            fullWidth
            label="Shopify Store URL"
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://store.myshopify.com"
            sx={{ mb: 3 }}
            helperText="Enter any Shopify store URL to begin comprehensive analysis"
          />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  height: 64,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  background: "linear-gradient(45deg, #00d4ff, #0099cc)",
                  transition: "all 0.3s ease",
                  "&:hover": { 
                    transform: "translateY(-2px)", 
                    boxShadow: "0 8px 25px rgba(0,212,255,0.3)"
                  }
                }}
                disabled={loading}
                onClick={fetchInsights}
                startIcon={<AnalyticsIcon />}
              >
                {loading ? <CircularProgress size={24} /> : "ANALYZE STORE"}
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
                sx={{
                  height: 64,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  background: "linear-gradient(45deg, #ff6b6b, #ee5a52)",
                  transition: "all 0.3s ease",
                  "&:hover": { 
                    transform: "translateY(-2px)", 
                    boxShadow: "0 8px 25px rgba(255,107,107,0.3)"
                  }
                }}
                disabled={competitorLoading}
                onClick={fetchCompetitors}
                startIcon={<TrendingUpIcon />}
              >
                {competitorLoading ? <CircularProgress size={24} /> : "FIND COMPETITORS"}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Results Section */}
        {(insights || competitors.length > 0) && (
          <Paper elevation={4} sx={{ mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={(e, v) => setTabValue(v)}
              centered
              sx={{ 
                borderBottom: 1, 
                borderColor: "divider",
                "& .MuiTab-root": { fontSize: "1rem", fontWeight: "bold" }
              }}
            >
              <Tab label="📊 Main Analysis" />
              <Tab label={`🏪 Competitors (${competitors.length})`} />
            </Tabs>
          </Paper>
        )}

        {/* Main Analysis Tab */}
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            insights && InsightCard(insights)
          )}
        </TabPanel>

        {/* Competitors Tab */}
        <TabPanel value={tabValue} index={1}>
          {competitorLoading ? (
            Array.from({ length: 3 }).map((_, i) => <LoadingSkeleton key={i} />)
          ) : competitors.length ? (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="h6">
                  🎯 Found {competitors.length} competitor{competitors.length > 1 ? 's' : ''} for analysis
                </Typography>
              </Alert>
              {competitors.map((c, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  {InsightCard(c, `🏪 Competitor ${i + 1}`)}
                </Box>
              ))}
            </Box>
          ) : (
            <Alert severity="warning" sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6">
                No competitors found yet. Click "Find Competitors" to discover similar stores!
              </Typography>
            </Alert>
          )}
        </TabPanel>
      </Container>
    </ThemeProvider>
  );
}
