namespace BlackTeaWeb
{
    public class JsonWebToken<T>
    {
        public bool IsValid { set; get; }
        public string Header { set; get; }
        public string Payload { set; get; }
        public string Sign { set; get; }
        public T Data { set; get; }
        public override string ToString()
        {
            return $"{Header}.{Payload}.{Sign}";
        }

    }
}
