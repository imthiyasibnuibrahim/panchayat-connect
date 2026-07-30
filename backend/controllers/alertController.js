const Alert = require('../models/Alert');
const GeoNotificationService = require('../services/geoNotificationService');

/**
 * @desc Create and Broadcast Geo-Targeted Emergency Alert (Panchayat Admin / KaWaCHaM)
 * @route POST /api/v1/alerts/broadcast
 * @access Private (Admin)
 */
exports.createGeoAlert = async (req, res) => {
  try {
    const { title, message, severity, polygonCoordinates, panchayatName, evacuationCampInfo } = req.body;

    if (!title || !message || !polygonCoordinates || !Array.isArray(polygonCoordinates)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: title, message, and polygonCoordinates array.',
      });
    }

    // Construct GeoJSON Polygon
    const affectedArea = {
      type: 'Polygon',
      coordinates: polygonCoordinates, // [[[lng, lat], [lng, lat], [lng, lat], [lng, lat]]]
    };

    const alert = await Alert.create({
      title,
      message,
      severity: (severity || 'warning').toLowerCase(),
      createdBy: req.user ? req.user._id : '60d0fe4f5311236168a109ca', // Admin ID
      affectedArea,
      panchayatName: panchayatName || 'General Panchayat',
      evacuationCampInfo,
      status: 'dispatching',
    });

    // Execute Geo-Targeted Broadcast in background service
    const dispatchSummary = await GeoNotificationService.broadcastGeoTargetedAlert(alert);

    return res.status(201).json({
      success: true,
      message: 'Geo-targeted disaster alert dispatched successfully.',
      data: {
        alertId: alert._id,
        affectedArea: alert.affectedArea,
        recipientsReached: dispatchSummary.recipientCount,
        smsSent: dispatchSummary.smsSent,
        pushSent: dispatchSummary.pushSent,
      },
    });
  } catch (error) {
    console.error('Error broadcasting emergency alert:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to trigger geo-alert dispatch system',
    });
  }
};

/**
 * @desc Fetch active emergency alerts for citizen's current GPS position
 * @route GET /api/v1/alerts/active-at-location
 * @access Public / Citizen
 */
exports.getAlertsForLocation = async (req, res) => {
  try {
    const { lng, lat } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({ success: false, error: 'Longitude (lng) and Latitude (lat) are required' });
    }

    const point = {
      type: 'Point',
      coordinates: [parseFloat(lng), parseFloat(lat)],
    };

    // Find all active emergency alerts whose GeoJSON Polygon covers this Point
    const activeAlerts = await Alert.find({
      status: 'active',
      affectedArea: {
        $geoIntersects: {
          $geometry: point,
        },
      },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: activeAlerts.length,
      data: activeAlerts,
    });
  } catch (error) {
    console.error('Error fetching active location alerts:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve active location alerts' });
  }
};
