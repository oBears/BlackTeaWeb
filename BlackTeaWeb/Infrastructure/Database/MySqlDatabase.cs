using Dapper;
using MySqlConnector;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace BlackTeaWeb
{
    public class MySqlDatabase: IDisposable
    {

        private readonly IDbConnection conn;
        private IDbTransaction transaction;

        public MySqlDatabase(string connectionString)
        {
            conn = new MySqlConnection(connectionString);
            conn.Open();
        }
        public void BeginTransaction()
        {
            transaction = conn.BeginTransaction();
        }
        public void Rollback()
        {
            transaction?.Rollback();
        }
        public void Commit()
        {
            transaction?.Commit();
        }
        public IEnumerable<T> Query<T>(string sql, object param = null)
        {
            return conn.Query<T>(sql, param, transaction);
        }
        public T QueryFirst<T>(string sql, object param = null)
        {
            return conn.Query<T>(sql, param, transaction).FirstOrDefault();
        }
        public int Execute(string sql, object param = null)
        {
            return conn.Execute(sql, param, transaction);
        }
        public T ExecuteScalar<T>(string sql, object param = null)
        {
            return conn.ExecuteScalar<T>(sql, param, transaction);
        }
        public void Dispose()
        {
            if (transaction != null)
            {
                transaction.Commit();
                transaction.Dispose();
            }
            if (conn != null && conn.State != ConnectionState.Closed)
                conn.Close();

        }
    }
}
