import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './GalleryPage.css';

function GalleryPage() {
  const { type } = useParams(); // 'images' or 'videos'
  const isImage = type === 'images';
  const [selectedImage, setSelectedImage] = useState(null);

  const items = isImage ? [
    { id: 1, src: '/assets/images/bilhajanet.jpeg', title: 'Grace Community' },
    { id: 2, src: '/assets/images/bilhajanet1.jpeg', title: 'Fellowship in Truth' },
    { id: 3, src: '/assets/images/bilhajanet2.jpeg', title: 'Spiritual Growth' },
    { id: 4, src: '/assets/images/bilhajanet3.jpeg', title: 'Word of Life' },
    { id: 5, src: '/assets/images/marion_eating_chapati.jpeg', title: 'Brotherly Love' },
    { id: 6, src: '/assets/images/newyear_3.jpeg', title: 'New Year 3' },
    { id: 7, src: '/assets/images/newyear2026_1.jpeg', title: 'New Year 2026 1' },
    { id: 8, src: '/assets/images/newyear2026_2.jpeg', title: 'New Year 2026 2' },
    { id: 9, src: '/assets/images/newyear2026.jpeg', title: 'New Year Celebration' },
    { id: 10, src: '/assets/images/newyear4.jpeg', title: 'New Year 4' },
    { id: 11, src: '/assets/images/sameating.jpeg', title: 'Sharing Meals' },
    { id: 12, src: '/assets/images/sundayschool.jpeg', title: 'Sunday School' },
    { id: 13, src: '/assets/images/sundayschool1.jpeg', title: 'Children Ministry' },
    { id: 14, src: '/assets/images/whatsapp.jpeg', title: 'WhatsApp Moments' },
    { id: 15, src: '/assets/images/whatsapp_image_2022_03_27_at_8.08.45_pm.jpeg', title: 'Worship 2022' },
    { id: 16, src: '/assets/images/whatsapp_image_2022_03_27_at_8.09.45_pm.jpeg', title: 'Grace 2022' },
    { id: 17, src: '/assets/images/whatsapp_image_2026_02_16_at_12.26.48_am.jpeg', title: 'Midnight Stars' },
    { id: 18, src: '/assets/images/whatsapp_image_2026_02_22_at_1.56.38_pm.jpeg', title: 'Golden Hour' },
    { id: 19, src: '/assets/images/whatsapp_image_2026_02_22_at_1.57.01_pm.jpeg', title: 'Evening Peace' },
    { id: 20, src: '/assets/images/whatsapp_image_2026_02_22_at_2.09.43_pm.jpeg', title: 'Morning Grace' },
    { id: 21, src: '/assets/images/whatsapp_image_2026_03_22_at_12.46.25_pm.jpeg', title: 'Worship Night' },
    { id: 22, src: '/assets/images/whatsapp_image_2026_03_22_at_12.47.09_pm.jpeg', title: 'Divine Message' },
    { id: 23, src: '/assets/images/whatsapp_image_2026_03_22_at_12.47.30_pm.jpeg', title: 'Path to Peace' },
    { id: 24, src: '/assets/images/whatsapp_image_2026_03_22_at_12.47.31_pm.jpeg', title: 'Morning Prayer' },
    { id: 25, src: '/assets/images/whatsapp_image_2026_03_27_at.jpeg', title: 'Church Moments' },
    { id: 26, src: '/assets/images/whatsapp_image_2026_03_27_at_8.0.jpeg', title: 'Spiritual Vision' },
    { id: 27, src: '/assets/images/whatsapp_image_2026_03_27_at_8.08..jpeg', title: 'Eternal Light' },
    { id: 28, src: '/assets/images/whatsapp_image_2026_03_27_at_8.08.35_pm.jpeg', title: 'Grace 35' },
    { id: 29, src: '/assets/images/whatsapp_image_2026_03_27_at_8.08.37_am.jpeg', title: 'Morning 37' },
    { id: 30, src: '/assets/images/whatsapp_image_2026_03_27_at_8.08.4.jpeg', title: 'Word of God 4' },
    { id: 31, src: '/assets/images/whatsapp_image_2026_03_27_at_8.08.42_pq.jpeg', title: 'Peace Pq' },
    { id: 32, src: '/assets/images/whatsapp_image_2026_03_27_at_8.08.42_pq1.jpeg', title: 'Peace Pq1' },
    { id: 33, src: '/assets/images/whatsapp_image_2026_03_27_at_8.08.43.jpeg', title: 'Divine 43' },
    { id: 34, src: '/assets/images/whatsapp_image_2026_03_27_at_8.08.43_pa.jpeg', title: 'Divine Pa' },
    { id: 35, src: '/assets/images/whatsapp_image_2026_03_27_at_8.08.43_pm.jpeg', title: 'Sacred Word' },
    { id: 36, src: '/assets/images/whatsapp_image_2026_03_27_at_8.08.43_ps.jpeg', title: 'Sacred Ps' },
    { id: 37, src: '/assets/images/whatsapp_image_2026_03_27_at_8.08.44_p.jpeg', title: 'Guidance 44' },
    { id: 38, src: '/assets/images/whatsapp_image_2026_03_27_at_8.08.44_pm.jpeg', title: 'Divine Guidance' },
    { id: 39, src: '/assets/images/whatsapp_image_2026_03_27_at_8.08.45_pm.jpeg', title: 'Evening Worship' },
    { id: 40, src: '/assets/images/whatsapp_image_2026_03_27_at_8.08.47_pm.jpeg', title: 'Evening 47' },
    { id: 41, src: '/assets/images/whatsapp_image_2026_03_27_at_8.08.jpeg', title: 'Faith 08' },
  ] : [
    { id: 1, src: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Divine Message' },
    { id: 2, src: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Worship Night' },
  ];

  const handleImageClick = (src) => {
    if (isImage) {
      setSelectedImage(src);
    }
  };

  return (
    <div className="gallery-page">
      <div className="container">
        <div className="gallery-header">
          <Link to="/portfolio" className="back-link">← Back to Portfolio</Link>
          <h1>Our {type?.charAt(0).toUpperCase() + type?.slice(1)} Gallery</h1>
          <p className="gallery-subtitle">A collection of visual art and moments from our community.</p>
        </div>

        <div className="gallery-grid">
          {items.map(item => (
            <div 
              key={item.id} 
              className={`gallery-item ${isImage ? 'clickable' : ''}`}
              onClick={() => handleImageClick(item.src)}
            >
              {isImage ? (
                <div className="img-container">
                  <img src={item.src} alt={item.title} />
                  <div className="img-overlay">
                    <i className="fas fa-search-plus"></i>
                  </div>
                </div>
              ) : (
                <iframe 
                  src={item.src} 
                  title={item.title}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              )}
              <div className="item-details">
                <h3>{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content">
            <img src={selectedImage} alt="Full size" />
            <button className="close-lightbox">×</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GalleryPage;
