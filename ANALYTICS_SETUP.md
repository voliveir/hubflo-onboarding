# Hubflo Analytics System

## Overview

The Hubflo Analytics System provides comprehensive tracking and insights for your onboarding platform, including:

- **Client Journey Analytics** - Track time spent in each onboarding stage
- **Conversion Rate Tracking** - Monitor conversion rates by package and stage
- **Integration Adoption Metrics** - See which integrations are most popular
- **Feature Usage Statistics** - Track feature adoption and satisfaction
- **Revenue Impact Tracking** - Monitor revenue growth and impact
- **Client Satisfaction Scores** - Collect and analyze client feedback

## Features

### 📊 Analytics Dashboard
- Real-time overview of key metrics
- Filterable by timeframe, package type, and date range
- Cached data for performance optimization
- Interactive charts and progress indicators

### 🔄 Conversion Tracking
- Stage-by-stage conversion rates
- Average duration in each stage
- Package-specific performance metrics
- Bottleneck identification

### 🎯 Client Journey Analytics
- Time tracking for each onboarding stage
- Completion rates and reasons
- Journey optimization insights
- Performance benchmarking

### 🔌 Integration Analytics
- Adoption rates by integration type
- Setup time tracking
- Success rate monitoring
- Package-specific integration performance

### ⚡ Feature Usage Analytics
- Feature adoption rates
- Usage frequency tracking
- User satisfaction scores
- Feature performance by package

### 💰 Revenue Analytics
- Revenue tracking by package
- Growth rate calculations
- Average revenue per client
- Revenue source analysis

### 😊 Satisfaction Analytics
- Overall satisfaction scores
- NPS (Net Promoter Score) tracking
- Detailed feedback collection
- Satisfaction trends over time

## Setup Instructions

### 1. Database Setup
Run the analytics setup script to create the necessary database tables:

```bash
node scripts/run-analytics-setup.js
```

This will:
- Create analytics tables in your Supabase database
- Add sample data for demonstration
- Set up proper indexes for performance
- Configure triggers for data updates

### 2. Access Analytics
Once setup is complete, access the analytics dashboard at:

```
/admin/analytics
```

### 3. Environment Variables
Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema

### Core Tables

#### `analytics_events`
Tracks all user interactions and stage transitions
- Event types and categories
- Stage transitions
- Package-specific data
- Session tracking

#### `client_journey_analytics`
Tracks time spent in each onboarding stage
- Stage start/completion times
- Duration calculations
- Completion reasons
- Performance metrics

#### `conversion_tracking`
Monitors conversion rates by package and stage
- Clients entered vs completed
- Conversion rate calculations
- Average duration metrics
- Period-based tracking

#### `integration_adoption_metrics`
Tracks integration usage and success
- Adoption rates by integration
- Setup time tracking
- Success rate monitoring
- Package-specific metrics

#### `feature_usage_statistics`
Monitors feature adoption and satisfaction
- Usage rates by feature
- User satisfaction scores
- Adoption frequency
- Package-specific usage

#### `revenue_impact_tracking`
Tracks revenue performance
- Revenue by package
- Growth rate calculations
- Client count metrics
- Period-based analysis

#### `client_satisfaction_scores`
Collects and analyzes client feedback
- Overall satisfaction scores
- NPS tracking
- Detailed feedback
- Survey date tracking

## Usage

### Filtering Data
- **Timeframe**: Last 7 days, 30 days, 90 days, or 6 months
- **Package Type**: All packages, Light, Premium, Gold, or Elite
- **Date Range**: Custom date range selection

### Key Metrics
- **Total Clients**: Overall client count with active status
- **Average Conversion Rate**: Overall conversion across all stages
- **Client Satisfaction**: Average satisfaction score out of 5
- **Total Revenue**: Revenue with growth percentage
- **Top Performing Package**: Package with highest client count

### Data Caching
Analytics data is cached for 1 hour to improve performance. Cache keys are based on:
- Selected timeframe
- Package filter
- Date range

## API Functions

### Core Analytics Functions
- `getAnalyticsOverview()` - Get overview metrics
- `getConversionAnalytics()` - Get conversion data
- `getIntegrationAdoptionMetrics()` - Get integration metrics
- `getFeatureUsageStatistics()` - Get feature usage data
- `getRevenueAnalytics()` - Get revenue data
- `getClientSatisfactionScores()` - Get satisfaction data

### Caching Functions
- `getAnalyticsCache()` - Retrieve cached data
- `setAnalyticsCache()` - Store data in cache
- `clearAnalyticsCache()` - Clear expired cache

### Event Tracking
- `trackAnalyticsEvent()` - Track user interactions
- `createClientJourneyEntry()` - Create journey tracking entry
- `updateClientJourneyEntry()` - Update journey data

## Customization

### Adding New Metrics
1. Add new columns to relevant tables
2. Update TypeScript interfaces in `lib/types.ts`
3. Add database functions in `lib/database.ts`
4. Update the analytics dashboard component

### Custom Filters
1. Add filter options to the dashboard
2. Update the fetch functions to handle new filters
3. Modify cache keys to include new filter parameters

### Custom Visualizations
1. Add new chart components
2. Integrate with charting libraries (Chart.js, Recharts, etc.)
3. Update the dashboard layout

## Performance Considerations

- Data is cached for 1 hour to reduce database load
- Indexes are created on frequently queried columns
- Pagination is implemented for large datasets
- Lazy loading for detailed analytics views

## Troubleshooting

### Common Issues

1. **"Error Loading Analytics"**
   - Check database connection
   - Verify environment variables
   - Ensure analytics tables exist

2. **"No data available"**
   - Run the setup script
   - Check if sample data was inserted
   - Verify date range selection

3. **Performance Issues**
   - Clear analytics cache
   - Check database indexes
   - Reduce date range scope

### Debug Mode
Enable debug logging by setting:
```env
NEXT_PUBLIC_DEBUG_ANALYTICS=true
```

## Future Enhancements

- Real-time analytics with WebSocket updates
- Advanced charting and visualizations
- Export functionality (CSV, PDF)
- Automated reporting and alerts
- Machine learning insights
- Custom dashboard builder
- API access for external tools
- Mobile analytics app

## Support

For issues or questions about the analytics system:
1. Check the troubleshooting section
2. Review database logs
3. Verify environment configuration
4. Contact the development team 