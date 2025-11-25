using UnityEngine;

namespace BlackRoad.Worldbuilder.Life
{
    /// <summary>
    /// Simple movement agent for critters. Handles forward walking and
    /// blends in optional steering from a HerdMember component when present.
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class CritterAgent : MonoBehaviour
    {
        [Header("Movement")]
        [SerializeField] private float walkSpeed = 2f;
        [SerializeField] private float turnSpeed = 120f;

        private Vector3 _velocity;
        private CharacterController _controller;
        private HerdMember _herdMember;

        public Vector3 Velocity => _velocity;

        private void Awake()
        {
            _controller = GetComponent<CharacterController>();
            _herdMember = GetComponent<HerdMember>();
        }

        private void Update()
        {
            WalkRoutine();
        }

        /// <summary>
        /// Sets the heading the critter should look toward.
        /// </summary>
        /// <param name="direction">Desired facing direction.</param>
        public void SetHeading(Vector3 direction)
        {
            if (direction.sqrMagnitude < 0.0001f) return;

            direction.y = 0f;
            Quaternion target = Quaternion.LookRotation(direction.normalized, Vector3.up);
            transform.rotation = Quaternion.RotateTowards(transform.rotation, target, turnSpeed * Time.deltaTime);
        }

        /// <summary>
        /// Walk forward while optionally blending in herd steering.
        /// </summary>
        private void WalkRoutine()
        {
            Vector3 moveDir = transform.forward;

            // Optional herd steering
            if (_herdMember != null && _herdMember.SteerOffset.sqrMagnitude > 0.0001f)
            {
                // Blend forward direction with herd steering
                moveDir = (moveDir + _herdMember.SteerOffset).normalized;
            }

            // Apply move
            Vector3 move = moveDir * walkSpeed;
            _velocity.x = move.x;
            _velocity.z = move.z;

            if (_controller != null)
            {
                _controller.SimpleMove(_velocity);
            }
            else
            {
                transform.position += _velocity * Time.deltaTime;
            }
        }
    }
}
