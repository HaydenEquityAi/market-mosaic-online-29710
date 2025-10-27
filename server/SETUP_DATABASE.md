# Database Setup Instructions

## Run this on your VPS (168.231.69.150)

### Prerequisites
- SSH access to the VPS
- PostgreSQL installed and running on the VPS
- Database `financial_market_db` already created

### Step 1: SSH to VPS
```bash
ssh root@168.231.69.150
```

### Step 2: Upload schema file

**Option A: Using SCP (from your local machine)**
```bash
scp server/database-schema.sql root@168.231.69.150:/tmp/schema.sql
```

**Option B: Copy from local machine (if already on VPS)**
```bash
# Create the file on VPS
nano /tmp/schema.sql
# Paste the contents of database-schema.sql, then save (Ctrl+O, Enter, Ctrl+X)
```

**Option C: Use cat to create file directly**
```bash
cat > /tmp/schema.sql << 'EOF'
-- Paste the entire content of database-schema.sql here
EOF
```

### Step 3: Run the schema
```bash
sudo -u postgres psql -U financeapp -d financial_market_db -h localhost -f /tmp/schema.sql
```

Or if you need to enter password:
```bash
PGPASSWORD=CPAhay2020. psql -U financeapp -d financial_market_db -h localhost -f /tmp/schema.sql
```

### Step 4: Verify tables created
```bash
PGPASSWORD=CPAhay2020. psql -U financeapp -d financial_market_db -h localhost -c "\dt"
```

Should show 4 tables:
- `portfolio_holdings`
- `portfolios`
- `transactions`
- `users`

### Step 5: Verify indexes
```bash
PGPASSWORD=CPAhay2020. psql -U financeapp -d financial_market_db -h localhost -c "\di"
```

Should show indexes for better query performance.

### Step 6: Check specific table structure
```bash
PGPASSWORD=CPAhay2020. psql -U financeapp -d financial_market_db -h localhost -c "\d portfolios"
PGPASSWORD=CPAhay2020. psql -U financeapp -d financial_market_db -h localhost -c "\d portfolio_holdings"
```

## Troubleshooting

### If you get "password authentication failed"
Check if the user exists:
```bash
sudo -u postgres psql -c "\du financeapp"
```

If user doesn't exist, create it:
```bash
sudo -u postgres psql -c "CREATE USER financeapp WITH PASSWORD 'CPAhay2020.';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE financial_market_db TO financeapp;"
```

### If you get "database does not exist"
Create the database:
```bash
sudo -u postgres psql -c "CREATE DATABASE financial_market_db;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE financial_market_db TO financeapp;"
```

### If you get connection errors
Check PostgreSQL is running:
```bash
sudo systemctl status postgresql
```

Allow remote connections (if needed):
```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/*/main/postgresql.conf

# Find and uncomment:
# listen_addresses = 'localhost'

# Then restart:
sudo systemctl restart postgresql
```

## Test Connection

From your local machine (to verify remote connection works):
```bash
psql -U financeapp -d financial_market_db -h 168.231.69.150
```

Enter password: `CPAhay2020.`

## Done!

Once tables are created:
1. Refresh the frontend: http://localhost:8081/portfolio
2. Try adding a stock to your portfolio
3. Data will be stored in the remote database!

## Schema Details

### Tables Created:
1. **users** - User accounts and authentication
2. **portfolios** - User investment portfolios
3. **portfolio_holdings** - Stocks/assets in each portfolio
4. **transactions** - Buy/sell transaction history

### Indexes Created:
- User ID lookups (faster portfolio retrieval)
- Portfolio ID lookups (faster holdings retrieval)
- Symbol lookups (faster stock searches)
- Transaction lookups (faster history retrieval)

