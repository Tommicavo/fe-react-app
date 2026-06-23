function LoginPage() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  console.log(`Test env variable import: baseUrl: ${baseUrl}`);

  return (
    <div className="container">
      <h1>Login Page</h1>
    </div>
  );
}

export default LoginPage;
