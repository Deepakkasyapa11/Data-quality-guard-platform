# Data Quality Guard Pro

An enterprise-grade client-side data quality validation platform built with modern web technologies. This application implements production-level metadata monitoring using the Gang of Four Strategy Pattern and statistical anomaly detection algorithms.

## Architecture Overview

### Local Prototype Stack
- **Build Tool**: Vite 7.x (Fast HMR, optimized production builds)
- **Frontend**: React 19 with TypeScript (Strict mode)
- **Styling**: Tailwind CSS (Industrial Dark theme with Slate palette)
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Storage**: IndexedDB (Client-side persistence)
- **Testing**: Vitest with React Testing Library

### Production AWS/PySpark Architecture Mapping

This local prototype maps directly to a scalable production architecture:

#### 1. Data Ingestion Layer
**Local**: MockDataService generates 100 E-commerce rows
**Production**: 
- AWS Glue for ETL pipelines
- S3 as data lake (Parquet format)
- AWS Kinesis for streaming ingestion
- PySpark for distributed data processing

#### 2. Validation Engine (Strategy Pattern)
**Local**: TypeScript ValidationEngine with three strategies
**Production**: 
- Apache Spark Jobs running PySpark validation logic
- AWS EMR cluster for scalable compute
- Strategy Pattern implemented in PySpark UDFs
- Custom data quality library deployed as Spark package

**Validation Strategies**:
```
CompletenessStrategy    → PySpark null/empty checks with .isNull()
NumericalRangeStrategy  → MLlib for outlier detection, Z-score computation
UniquenessStrategy      → Spark SQL DISTINCT counts and duplicate detection
```

#### 3. Statistical Analysis
**Local**: statsUtils.ts (Z-Score, KL-Divergence, histogram generation)
**Production**:
- PySpark MLlib for statistical computations
- AWS SageMaker for advanced anomaly detection models
- Custom Spark aggregations for distribution analysis

#### 4. Alert & Monitoring System
**Local**: IndexedDB alert storage with severity levels
**Production**:
- Amazon SNS for alert notifications
- Amazon CloudWatch for operational monitoring
- AWS DynamoDB for alert history storage
- AWS Lambda for alert processing and routing
- PagerDuty/Slack integration for critical alerts

#### 5. Data Storage
**Local**: IndexedDB (5-50MB browser limit)
**Production**:
- Amazon S3 (Data Lake) for raw/processed data
- Amazon Aurora PostgreSQL for metadata catalog
- AWS Glue Data Catalog for schema registry
- Amazon Redshift for analytical queries

#### 6. Visualization & Reporting
**Local**: React components with Recharts
**Production**:
- Amazon QuickSight for BI dashboards
- React/Next.js frontend on AWS Amplify
- API Gateway + Lambda for serverless backend
- Real-time updates via WebSocket (API Gateway)

#### 7. Orchestration
**Production Only**:
- Apache Airflow on AWS MWAA for workflow orchestration
- AWS Step Functions for validation pipeline coordination
- AWS EventBridge for event-driven architecture

## Project Structure

```
/src
├── core/
│   ├── ValidationEngine.ts     # Strategy Pattern implementation
│   ├── statsUtils.ts            # Statistical computations (Z-Score, KL-Divergence)
│   └── MockDataService.ts       # IndexedDB persistence layer
├── components/
│   ├── Dashboard.tsx            # Main metrics & control panel
│   ├── DatasetDetail.tsx        # Raw data explorer with anomaly highlighting
│   └── AlertFeed.tsx            # Real-time alert stream
└── tests/
    ├── validation.test.ts       # Vitest unit tests for Strategy Pattern
    └── setup.ts                 # Test environment configuration
```

## Data Quality Checks Implemented

### 1. Completeness Validation
Detects missing/null values in critical columns.
- **Metric**: Failure rate (missing rows / total rows)
- **Severity**: Critical (>10%), Warning (>1%), Info (<1%)
- **Demo Failure**: Row 15 has null email

### 2. Uniqueness Validation
Identifies duplicate values in columns requiring unique identifiers.
- **Algorithm**: Hash map tracking with O(n) complexity
- **Severity**: Critical for any duplicates
- **Demo Failure**: Row 42 has duplicate Order ID (ORD-1025)

### 3. Anomaly Detection (Numerical Range)
Statistical outlier detection using Z-Score analysis.
- **Algorithm**: Z = (x - μ) / σ
- **Threshold**: |Z| > 3 (3 standard deviations)
- **Severity**: Based on anomaly rate
- **Demo Failure**: Row 87 has $50,000 price (extreme outlier)

### 4. Data Drift Detection
Monitors distribution changes over time using KL-Divergence.
- **Algorithm**: KL(P || Q) = Σ P(i) log(P(i) / Q(i))
- **Use Case**: Baseline vs. current distribution comparison
- **Implementation**: statsUtils.ts `detectDrift()` function

## Demo Mode

Click **"Seed Demo Data"** to generate:
- 100 E-commerce transaction rows
- Realistic product catalog (8 items)
- Normal price distribution ($50-$550)
- **3 Injected DQ Failures**:
  1. Row 15: Empty email (Completeness)
  2. Row 42: Duplicate Order ID (Uniqueness)
  3. Row 87: $50,000 price (Anomaly)

All failures are automatically detected and logged to the Alert Feed.

## Getting Started

### Installation
```bash
cd frontend
yarn install
```

### Development
```bash
yarn dev
```
Access at `http://localhost:3000`

### Testing
```bash
# Run tests
yarn test

# Run tests with UI
yarn test:ui
```

### Build
```bash
yarn build
```

## Design System

**Theme**: Industrial Dark
- **Primary**: Slate 950 background
- **Cards**: Slate 900 with Slate 800 borders
- **Text**: Slate 100 (primary), Slate 400 (secondary)
- **Monospace**: JetBrains Mono for logs and metrics
- **Accent Colors**: Red (critical), Yellow (warning), Blue (info)

**Design Principles**:
- No shadows or gradients (clean, data-focused aesthetic)
- Ultra-clean borders for card separation
- Monospace fonts for technical readability
- High contrast for accessibility

## Production Migration Checklist

When moving to AWS/PySpark:

### Phase 1: Core Infrastructure
- [ ] Set up AWS EMR cluster with Spark 3.x
- [ ] Configure S3 buckets (raw, processed, analytics)
- [ ] Deploy AWS Glue Data Catalog
- [ ] Set up VPC, security groups, IAM roles

### Phase 2: Data Pipeline
- [ ] Convert MockDataService to S3 data loader
- [ ] Implement PySpark ETL jobs in AWS Glue
- [ ] Set up Kinesis streams for real-time ingestion
- [ ] Configure partitioning strategy (date-based)

### Phase 3: Validation Engine
- [ ] Port ValidationEngine to PySpark UDFs
- [ ] Implement strategy classes in Python
- [ ] Deploy as Spark package to EMR
- [ ] Set up validation job scheduling (Airflow)

### Phase 4: Storage & Metadata
- [ ] Migrate alert storage to DynamoDB
- [ ] Set up RDS Aurora for application metadata
- [ ] Configure Redshift for analytical queries
- [ ] Implement data retention policies

### Phase 5: Monitoring & Alerts
- [ ] Configure CloudWatch dashboards
- [ ] Set up SNS topics for alert routing
- [ ] Integrate Slack/PagerDuty webhooks
- [ ] Implement alert throttling logic

### Phase 6: Frontend & API
- [ ] Deploy React app to AWS Amplify
- [ ] Build serverless API (API Gateway + Lambda)
- [ ] Implement authentication (Cognito)
- [ ] Set up CloudFront CDN

### Phase 7: Orchestration
- [ ] Deploy Airflow on AWS MWAA
- [ ] Create DAGs for validation workflows
- [ ] Set up Step Functions for complex pipelines
- [ ] Configure EventBridge rules

## Performance Benchmarks

**Local (100 rows)**:
- Validation: <10ms per rule
- IndexedDB read: ~5ms
- Chart rendering: <100ms

**Production Estimates (1B rows)**:
- PySpark validation: 5-10 minutes (EMR cluster with 20 nodes)
- S3 write: 2-3 minutes (Parquet compression)
- Redshift query: <5 seconds (materialized views)

## Technology Decisions

### Why Vite over CRA?
- 10x faster HMR in development
- Optimized production builds (ESBuild)
- Native ES modules support
- Modern TypeScript integration

### Why IndexedDB?
- 50MB+ storage (vs. 5MB localStorage)
- Asynchronous API (non-blocking)
- Structured data storage with indexes
- Browser-native (no external dependencies)

### Why Strategy Pattern?
- Open/Closed Principle (easy to add new validations)
- Testable in isolation
- Direct mapping to PySpark UDFs
- Enterprise-grade code organization

### Why TypeScript Strict Mode?
- Catches bugs at compile time
- Better IDE support
- Enforces type safety
- Production-ready code quality

## License

MIT License - Copyright (c) 2024 Data Quality Engineering Team

## Architecture Patterns

This codebase implements several enterprise-grade design patterns:

- **Strategy Pattern** (Gang of Four): Pluggable validation algorithms with runtime selection
- **Singleton Pattern**: Centralized data service instance for IndexedDB management
- **Repository Pattern**: Clean separation between data access (MockDataService) and business logic
- **Observer Pattern**: React state management for real-time UI updates

## Contributing

Contributions are welcome. Please ensure all new validation strategies implement the `ValidationStrategy` interface and include comprehensive unit tests using Vitest.
