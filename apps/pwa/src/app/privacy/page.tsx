export default function PrivacyPage() {
  return (
    <div className="p-8 prose">
      <h1>Privacy Policy</h1>
      <p>
        UICare stores conversation data encrypted on the server using a secret key. This data is used solely to provide the
        requested services and is never shared with third parties.
      </p>
      <p>
        Authentication tokens are required to access API routes. Keep these credentials secure and rotate them regularly. For
        more details on managing encryption keys, see our documentation.
      </p>
    </div>
  );
}
