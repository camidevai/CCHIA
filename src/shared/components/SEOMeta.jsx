/* eslint-disable react/prop-types */
import { Helmet } from 'react-helmet-async';

const SEOMeta = ({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType,
  twitterCard,
  jsonLD,
}) => (
  <Helmet>
    <title>{title} | CCHIA</title>
    {description && <meta name="description" content={description} />}
    {canonical && <link rel="canonical" href={canonical} />}
    <meta property="og:title" content={ogTitle || title} />
    {(ogDescription || description) && (
      <meta property="og:description" content={ogDescription || description} />
    )}
    {ogImage && <meta property="og:image" content={ogImage} />}
    <meta property="og:url" content={ogUrl || canonical} />
    {ogType && <meta property="og:type" content={ogType} />}
    <meta name="twitter:card" content={twitterCard || 'summary_large_image'} />
    <meta name="twitter:title" content={ogTitle || title} />
    {(ogDescription || description) && (
      <meta name="twitter:description" content={ogDescription || description} />
    )}
    {ogImage && <meta name="twitter:image" content={ogImage} />}
    {jsonLD && (
      <script type="application/ld+json">{JSON.stringify(jsonLD)}</script>
    )}
  </Helmet>
);

export default SEOMeta;
