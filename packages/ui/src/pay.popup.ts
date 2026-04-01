
function openAuthPopup() {
  const url = 'https://auth.example.com';
  const name = 'AuthPopup';
  const width = 500;
  const height = 600;
  
  // Calculate center position
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  const authWindow = window.open(
    url,
    name,
    `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes,status=no`
  );

  // Monitor the popup to know when it closes
  const checkClosed = setInterval(() => {
    if (authWindow?.closed) {
      clearInterval(checkClosed);
      console.log('Authentication window closed');
      // Perform post-auth actions here (e.g., refreshing user state)
    }
  }, 500);
}
