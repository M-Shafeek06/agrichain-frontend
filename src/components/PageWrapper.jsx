function PageWrapper({ children }) {
  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 24px"
      }}
    >
      {children}
    </div>
  );
}

export default PageWrapper;
