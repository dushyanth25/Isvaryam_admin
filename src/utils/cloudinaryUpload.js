async function uploadToCloudinary(file) {
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', 'isvaryam'); // Replace with your Cloudinary upload preset

  const res = await fetch('https://api.cloudinary.com/v1_1/ddv0mpecp/image/upload', {
    method: 'POST',
    body: data,
  });
  const json = await res.json();
  return json.secure_url;
}